import ERC20_ABI from 'human-standard-token-abi'
import helpers, { apiLooper, constants, cacheStorageGet, cacheStorageSet } from 'helpers'
import { getState } from 'redux/core'
import actions from 'redux/actions'
import web3 from 'helpers/web3'
import reducers from 'redux/core/reducers'
import config from 'app-config'
import { BigNumber } from 'bignumber.js'


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

  const data = {
    address: ethAddress,
    balance: 0,
    name: nameContract.toLowerCase(),
    fullName,
    currency: nameContract.toUpperCase(),
    contractAddress,
    decimals,
    currencyRate: 1
  }

  reducers.user.setTokenAuthData({ name: data.name, data })
}


const getBalance = async (currency) => {
  const { user: { tokensData } } = getState()

  if (currency === undefined) {
    return
  }

  const balanceInCache = cacheStorageGet('currencyBalances', `token_${currency}`)
  if (balanceInCache !== false) return balanceInCache

  const { address, contractAddress, decimals, name  } = tokensData[currency.toLowerCase()]
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

const getTransaction = (address, ownType) =>
  new Promise((resolve) => {
    const { user: { tokensData } } = getState()

    if (ownType === undefined) {
      return
    }

  
    const { address, contractAddress } = tokensData[ownType.toLowerCase()]

    console.log('currency', address, contractAddress)

    const url = [
      `?module=account&action=tokentx`,
      `&contractaddress=${contractAddress}`,
      `&address=${address}`,
      `&startblock=0&endblock=99999999`,
      `&sort=asc&apikey=RHHFPNMAZMD6I4ZWBZBF6FA11CMW9AXZNM`,
    ].join('')

    return apiLooper.get('etherscan', url)
      .then((res) => {
        const transactions = res.result
          .filter((item) => item.value > 0).map((item) => ({
            confirmations: item.confirmations,
            type: item.tokenSymbol,
            hash: item.hash,
            contractAddress: item.contractAddress,
            status: item.blockHash != null ? 1 : 0,
            value: new BigNumber(String(item.value)).dividedBy(new BigNumber(10).pow(Number(item.tokenDecimal))).toNumber(),
            address: item.to,
            date: item.timeStamp * 1000,
            direction: address.toLowerCase() === item.to.toLowerCase() ? 'in' : 'out',
          }))
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

  const toWei = amount => BigNumber(amount).times(BigNumber(10).pow(decimals)).toString()
  const fromWei = wei => BigNumber(wei).div(BigNumber(10).pow(decimals))

  return { tokenContract, decimals, toWei, fromWei }
}

const fetchFees = async ({ gasPrice, gasLimit, speed } = {}) => {
  gasPrice = gasPrice || await helpers.eth.estimateGasPrice({ speed })
  gasLimit = gasLimit || constants.defaultFeeRates.ethToken.limit.send

  return {
    gas: gasLimit,
    gasPrice,
  }
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

const send = async ({ name, to, amount, ...feeConfig } = {}) => {
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
    { args: [ to, newAmount ], params })
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

export default {
  login,
  getBalance,
  getTransaction,
  send,
  approve,
  setAllowanceForToken,
  fetchBalance,
  AddCustomERC20,
  GetCustromERC20,
}
