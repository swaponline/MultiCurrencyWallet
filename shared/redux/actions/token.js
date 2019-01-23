import abi from 'human-standard-token-abi'
import helpers, { request, constants } from 'helpers'
import { getState } from 'redux/core'
import actions from 'redux/actions'
import web3 from 'helpers/web3'
import reducers from 'redux/core/reducers'
import config from 'app-config'
import { BigNumber } from 'bignumber.js'


BigNumber.config({ RANGE: [-1e+9, 1e+9], POW_PRECISION: 0  })

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
  }

  reducers.user.setTokenAuthData({ name: data.name, data })
}


const getBalance = async (currency) => {
  const { user: { tokensData } } = getState()

  if (currency === undefined) {
    return
  }
  const { address, contractAddress, decimals, name  } = tokensData[currency.toLowerCase()]
  const ERC20 = new web3.eth.Contract(abi, contractAddress)
  try {
    const result = await ERC20.methods.balanceOf(address).call()
    console.log('result get balance', result)
    let amount = new BigNumber(String(result)).dividedBy(new BigNumber(String(10)).pow(decimals)).toString()
    reducers.user.setTokenBalance({ name, amount })
    return amount
  } catch (e) {
    reducers.user.setTokenBalanceError({ name })
  }
}


const fetchBalance = async (address, contractAddress, decimals) => {

  const ERC20 = new web3.eth.Contract(abi, contractAddress)
  const result = await ERC20.methods.balanceOf(address).call()

  const amount = new BigNumber(String(result)).dividedBy(new BigNumber(String(10)).pow(decimals)).toString()
  return amount
}

const getTransaction = (currency) =>
  new Promise((resolve) => {
    const { user: { tokensData } } = getState()

    if (currency === undefined) {
      return
    }

    const { address, contractAddress } = tokensData[currency.toLowerCase()]

    console.log('currency', address, contractAddress)

    const url = [
      `https://api-rinkeby.etherscan.io/api?module=account&action=tokentx`,
      `&contractaddress=${contractAddress}`,
      `&address=${address}`,
      `&startblock=0&endblock=99999999`,
      `&sort=asc&apikey=RHHFPNMAZMD6I4ZWBZBF6FA11CMW9AXZNM`,
    ].join('')

    return request.get(url)
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

const send = ({ name, to, amount, gasPrice, gasLimit, speed } = {}) =>
  new Promise(async (resolve, reject) => {
    if (!name) {
      throw new Error('send: name is undefined')
    }

    const { user: { tokensData: { [name]: { address, contractAddress, decimals } } } } = getState()

    gasPrice = gasPrice || await helpers.eth.estimateGasPrice({ speed })
    gasLimit = gasLimit || constants.defaultFeeRates.eth.limit.send

    const params = {
      from: address,
      gas: gasLimit,
      gasPrice,
    }

    const tokenContract = new web3.eth.Contract(abi, contractAddress, params)
    const newAmount = new BigNumber(String(amount)).times(new BigNumber(10).pow(decimals)).integerValue()

    const receipt = await tokenContract.methods.transfer(to, newAmount).send()
      .on('transactionHash', (hash) => {
        const txId = `${config.link.etherscan}/tx/${hash}`
        actions.loader.show(true, { txId })
      })
      .on('error', (err) => {
        reject(err)
      })

    resolve(receipt)
  })

export default {
  login,
  getBalance,
  getTransaction,
  send,
  fetchBalance,
}
