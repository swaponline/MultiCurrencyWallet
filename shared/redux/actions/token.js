import ERC20_ABI from 'human-standard-token-abi'
import helpers, { apiLooper, constants, cacheStorageGet, cacheStorageSet } from 'helpers'
import { getState } from 'redux/core'
import actions from 'redux/actions'
import web3 from 'helpers/web3'
import reducers from 'redux/core/reducers'
import config from 'helpers/externalConfig'
import { BigNumber } from 'bignumber.js'
import InputDataDecoder from 'ethereum-input-data-decoder'


const hasAdminFee = (
  config
  && config.opts
  && config.opts.fee
  && config.opts.fee.erc20
  && config.opts.fee.erc20.fee
  && config.opts.fee.erc20.address
  && config.opts.fee.erc20.min
) ? config.opts.fee.erc20 : false

const erc20Decoder = new InputDataDecoder(ERC20_ABI)

const AddCustomERC20 = (contract, symbol, decimals) => {
  const configStorage = (process.env.MAINNET) ? 'mainnet' : 'testnet'

  let tokensInfo = JSON.parse(localStorage.getItem(constants.localStorage.customERC))
  if (!tokensInfo) {
    tokensInfo = {
      mainnet: {},
      testnet: {},
    }
  }
  tokensInfo[configStorage][contract] = {
    address: contract,
    symbol,
    decimals,
  }
  localStorage.setItem(constants.localStorage.customERC, JSON.stringify(tokensInfo))
}

const GetCustromERC20 = () => {
  const configStorage = (process.env.MAINNET) ? 'mainnet' : 'testnet'

  let tokensInfo = JSON.parse(localStorage.getItem(constants.localStorage.customERC))
  if (!tokensInfo || !tokensInfo[configStorage]) return {}
  return tokensInfo[configStorage]
}

const login = (privateKey, contractAddress, nameContract, decimals, fullName) => {
  let data
  if (privateKey) {
    data = web3.eth.accounts.privateKeyToAccount(privateKey)
  } else {
    console.info('Created account ETH Token ...')
    data = web3.eth.accounts.create()
    web3.eth.accounts.wallet.add(data)
  }

  web3.eth.accounts.wallet.add(data.privateKey)
  console.info('Logged in with ETH Token', data)

  setupContract(data.address, contractAddress, nameContract, decimals, fullName)
}


const setupContract = (ethAddress, contractAddress, nameContract, decimals, fullName) => {
  if (!web3.eth.accounts.wallet[ethAddress]) {
    throw new Error('web3 does not have given address')
  }

  const isSweeped = actions.eth.isSweeped()

  const data = {
    address: ethAddress,
    balance: 0,
    name: nameContract.toLowerCase(),
    fullName,
    currency: nameContract.toUpperCase(),
    contractAddress,
    decimals,
    currencyRate: 1,
    isMnemonic: isSweeped,
  }

  reducers.user.setTokenAuthData({ name: data.name, data })


  if (!isSweeped && false) {
    const mnemonicTokenData = {
      address: actions.eth.getSweepAddress(),
      balance: 0,
      name: nameContract.toLowerCase(),
      fullName: `${fullName} (New)`,
      currency: nameContract.toUpperCase(),
      contractAddress,
      decimals,
      currencyRate: 1,
      isMnemonic: true,
      reducerDataTarget: `mnemonic_${nameContract.toUpperCase()}`,
    }

    reducers.user.setTokenAuthData({
      name: mnemonicTokenData.reducerDataTarget,
      data: mnemonicTokenData,
    })
  }
}


const getBalance = async (currency) => {
  const { user: { tokensData } } = getState()

  if (currency === undefined) {
    return
  }
  const balanceInCache = cacheStorageGet('currencyBalances', `token_${currency}`)
  if (balanceInCache !== false) return balanceInCache

  const { address, contractAddress, decimals, name } = tokensData[currency.toLowerCase()]
  const ERC20 = new web3.eth.Contract(ERC20_ABI, contractAddress)
  try {
    const result = await ERC20.methods.balanceOf(address).call()
    console.log('result get balance', result)
    let amount = new BigNumber(String(result)).dividedBy(new BigNumber(String(10)).pow(decimals)).toString()
    reducers.user.setTokenBalance({ name, amount })
    cacheStorageSet('currencyBalances', `token_${currency}`, amount, 60)
    return amount
  } catch (e) {
    reducers.user.setTokenBalanceError({ name })
  }
}


const fetchBalance = async (address, contractAddress, decimals) => {

  const ERC20 = new web3.eth.Contract(ERC20_ABI, contractAddress)
  const result = await ERC20.methods.balanceOf(address).call()

  const amount = new BigNumber(String(result)).dividedBy(new BigNumber(String(10)).pow(decimals)).toString()
  return amount
}

const getTransaction = (ownAddress, ownType) =>
  new Promise((resolve) => {
    const { user: { tokensData } } = getState()

    if (ownType === undefined) {
      console.warn('getTransaction - token type not deffined', ownAddress, ownType)
      resolve([])
      return
    }


    const { address, contractAddress } = tokensData[ownType.toLowerCase()]

    console.log('currency', address, contractAddress)

    const url = [
      `?module=account&action=tokentx`,
      `&contractaddress=${contractAddress}`,
      `&address=${(ownAddress) || address}`,
      `&startblock=0&endblock=99999999`,
      `&sort=asc&apikey=${config.api.etherscan_ApiKey}`,
    ].join('')

    return apiLooper.get('etherscan', url)
      .then((res) => {
        const transactions = res.result
          .filter((item) => item.value > 0)
          .map((item) => ({
            confirmations: item.confirmations,
            type: ownType.toLowerCase(),
            hash: item.hash,
            contractAddress: item.contractAddress,
            status: item.blockHash != null ? 1 : 0,
            value: new BigNumber(String(item.value)).dividedBy(new BigNumber(10).pow(Number(item.tokenDecimal))).toNumber(),
            address: item.to,
            date: item.timeStamp * 1000,
            direction: address.toLowerCase() === item.to.toLowerCase() ? 'in' : 'out',
          }))
          .filter((item) => {
            if (item.direction === 'in') return true
            if (!hasAdminFee) return true
            if (address.toLowerCase() === hasAdminFee.address.toLowerCase()) return true
            if (item.address.toLowerCase() === hasAdminFee.address.toLowerCase()) return false

            return true
          })
        resolve(transactions)
      })
      .catch(() => {
        resolve([])
      })
  })

const withToken = (name) => {
  if (!name) {
    throw new Error('send: name is undefined')
  }

  name = name.toLowerCase()

  const { user: { tokensData: { [name]: { address } } } } = getState()
  const { [name]: { address: contractAddress, decimals } } = config.erc20

  const tokenContract = new web3.eth.Contract(ERC20_ABI, contractAddress, { from: address })

  const toWei = amount => BigNumber(amount).times(BigNumber(10).pow(decimals)).toString(10)
  const fromWei = wei => BigNumber(wei).div(BigNumber(10).pow(decimals))

  return { contractAddress, tokenContract, decimals, toWei, fromWei }
}

const fetchFees = async ({ gasPrice, gasLimit, speed } = {}) => {
  gasPrice = gasPrice || await helpers.eth.estimateGasPrice({ speed })
  gasLimit = gasLimit || constants.defaultFeeRates.ethToken.limit.send

  return {
    gas: gasLimit,
    gasPrice,
  }
}

const getTx = (txRaw) => txRaw.transactionHash

const getTxRouter = (txId, currency) => `/token/${currency.toUpperCase()}/tx/${txId}`


const getLinkToInfo = (tx) => {

  if (!tx) {
    return
  }

  return `https://etherscan.io/tx/${tx}`
}

const sendTransaction = ({ contract, method }, { args, params = {} } = {}, callback) =>
  new Promise(async (resolve, reject) => {
    const receipt = await contract.methods[method](...args).send(params)
      .on('transactionHash', (hash) => {
        // eslint-disable-next-line
        callback && callback(hash)
      })
      .catch((error) => {
        reject(error)
      })

    resolve(receipt)
  })

const send = (data) => (hasAdminFee) ? sendWithAdminFee(data) : sendDefault(data)

const sendWithAdminFee = async ({ name, to, amount, ...feeConfig } = {}) => {
  const { tokenContract, toWei } = withToken(name)
  const {
    fee: adminFee,
    address: adminFeeAddress,
    min: adminFeeMinValue,
  } = config.opts.fee.erc20

  const adminFeeMin = BigNumber(adminFeeMinValue)

  // fee - from amount - percent
  let feeFromAmount = BigNumber(adminFee).dividedBy(100).multipliedBy(amount)
  if (adminFeeMin.isGreaterThan(feeFromAmount)) feeFromAmount = adminFeeMin

  feeFromAmount = toWei(feeFromAmount.toNumber()) // Admin fee

  const params = await fetchFees({ ...feeConfig })

  const newAmount = toWei(amount)
  const callMethod = { contract: tokenContract, method: 'transfer' }

  return new Promise((resolve, reject) => {
    const receipt = tokenContract.methods.transfer(to, newAmount).send(params)
      .on('transactionHash', (hash) => {
        const txId = `${config.link.etherscan}/tx/${hash}`
        actions.loader.show(true, { txId })

      })
      .on('error', (err) => {
        reject(err)
      })

    receipt.then(() => {
      resolve(receipt)
      // Send admin fee
      new Promise(async () => {
        const receiptAdminFee = await tokenContract.methods.transfer(adminFeeAddress, feeFromAmount).send(params)
          .on('transactionHash', (hash) => {
            console.log('ERC20 admin fee tx', hash)
          })
      })
    })

  })
}

const sendDefault = async ({ name, to, amount, ...feeConfig } = {}) => {
  const { tokenContract, toWei } = withToken(name)
  const params = await fetchFees({ ...feeConfig })

  const newAmount = toWei(amount)
  const callMethod = { contract: tokenContract, method: 'transfer' }

  // return sendTransaction(
  //   { contract: tokenContract, method: 'transfer' },
  //   { args: [ to, newAmount ], params },
  //   (hash) => {
  //     const txId = `${config.link.etherscan}/tx/${hash}`
  //     actions.loader.show(true, { txId })
  //   })

  return new Promise(async (resolve, reject) => {
    const receipt = await tokenContract.methods.transfer(to, newAmount).send(params)
      .on('transactionHash', (hash) => {
        const txId = `${config.link.etherscan}/tx/${hash}`
        actions.loader.show(true, { txId })
      })
      .on('error', (err) => {
        reject(err)
      })

    resolve(receipt)
  })
}

const approve = async ({ name, to, amount, ...feeConfig } = {}) => {
  const { tokenContract, toWei } = withToken(name)
  const params = await fetchFees({ ...feeConfig })

  const newAmount = toWei(amount)

  return sendTransaction(
    { contract: tokenContract, method: 'approve' },
    { args: [to, newAmount], params })
}

const setAllowanceForToken = async ({ name, to, targetAllowance, ...config }) => {
  const { tokenContract, toWei } = withToken(name)

  name = name.toLowerCase()

  const { user: { tokensData: { [name]: { address } } } } = getState()

  const allowance = await tokenContract.methods.allowance(address, to).call()

  // if there is already enough allowance, skip
  if (toWei(targetAllowance).isLessThanOrEqualTo(allowance)) {
    return Promise.resolve()
  }
  // but if not, set allowance to 1 billion (or requested target allowance, if it's bigger than 1 billion)

  const newTargetAllowance = BigNumber.max(1e9, targetAllowance)

  return approve({ name, to, amount: newTargetAllowance, ...config })
}

const fetchTxInfo = (hash, cacheResponse) => new Promise((resolve) => {
  const { user: { tokensData } } = getState()

  const url = `?module=proxy&action=eth_getTransactionByHash&txhash=${hash}&apikey=${config.api.etherscan_ApiKey}`

  return apiLooper.get('etherscan', url, {
    cacheResponse,
  })
    .then((res) => {
      if (res && res.result) {
        let amount = 0
        let receiverAddress = res.result.to
        const contractAddress = res.result.to
        let tokenDecimal = 18
        // Определим токен по адрессу контракта
        Object.keys(tokensData).forEach((key) => {
          if (tokensData[key]
              && tokensData[key].contractAddress
              && tokensData[key].contractAddress == contractAddress
              && tokensData[key].decimals
          ) {
            tokenDecimal = tokensData[key].decimals
            return false
          }
        })

        const txData = erc20Decoder.decodeData(res.result.input)
        if (txData
            && txData.name === `transfer`
            && txData.inputs
            && txData.inputs.length == 2
        ) {
          receiverAddress = `0x${txData.inputs[0]}`
          amount = BigNumber(txData.inputs[1]).div(BigNumber(10).pow(tokenDecimal)).toString()
        } else {
          // This is not erc20 transfer tx
        }

        const {
          from,
          gas,
          gasPrice,
          blockHash,
        } = res.result

        // Calc miner fee, used for this tx
        const minerFee = BigNumber(web3.utils.toBN(gas).toNumber())
          .multipliedBy(web3.utils.toBN(gasPrice).toNumber())
          .dividedBy(1e18).toNumber()

        let adminFee = false

        if (hasAdminFee) {
          adminFee = BigNumber(hasAdminFee.fee).dividedBy(100).multipliedBy(amount)
          if (BigNumber(hasAdminFee.min).isGreaterThan(adminFee)) adminFee = BigNumber(hasAdminFee.min)
          adminFee = adminFee.toNumber()
        }

        resolve({
          amount,
          afterBalance: null,
          receiverAddress,
          senderAddress: from,
          minerFee,
          minerFeeCurrency: 'ETH',
          adminFee,
          confirmed: (blockHash != null),
        })

      } else {
        resolve(false)
      }
    })
    .catch((err) => {
      console.log(err)
      resolve(false)
    })
})

export default {
  login,
  getBalance,
  getTransaction,
  send,
  getTx,
  getLinkToInfo,
  approve,
  setAllowanceForToken,
  fetchBalance,
  AddCustomERC20,
  GetCustromERC20,
  fetchTxInfo,
  getTxRouter,
  withToken,
}
