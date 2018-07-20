import abi from 'human-standard-token-abi'
import { request } from 'helpers'
import { getState } from 'redux/core'
import web3 from 'helpers/web3'
import reducers from 'redux/core/reducers'
import config from 'app-config'
import { BigNumber } from 'bignumber.js'


BigNumber.config({ DECIMAL_PLACES: 21 })


const login = (privateKey, contractAddress, nameContract, decimals) => {
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


  setupContract(data.address, contractAddress, nameContract, decimals)
}


const setupContract = (ethAddress, contractAddress, nameContract, decimals) => {
  if (!web3.eth.accounts.wallet[ethAddress]) {
    throw new Error('web3 does not have given address')
  }

  const data = {
    address: ethAddress,
    balance: 0,
    name: nameContract,
    currency: nameContract.toUpperCase(),
    contractAddress,
    decimals,
  }

  reducers.user.setTokenAuthData({ name: data.name, data })
}


const getBalance = (contractAddress, name, decimals) => {
  const { user: { ethData: { address } } } = getState()
  const url = `${config.api.etherscan}?module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${address}`

  if (name === undefined) {
    return null
  }

  return request.get(url)
    .then(({ result }) => {
      const amount = new BigNumber(String(result))
        .dividedBy(new BigNumber(String(10)).pow(decimals)).toNumber()

      reducers.user.setTokenBalance({ name, amount })
      return result
    }).catch(r => console.error('Token service isn\'t available, try later'))
}

const fetchBalance = (address) =>
  request.get(`https://rinkeby.etherscan.io/api?module=account&action=tokenbalance&contractaddress=0x60c205722c6c797c725a996cf9cca11291f90749&address=${address}`)
    .then(({ result }) => result)


const getTransaction = (contractAddress) =>
  new Promise((resolve) => {
    const { user: { ethData: { address } } } = getState()

    const url = [
      `https://api-rinkeby.etherscan.io/api?module=account&action=tokentx`,
      `&contractaddress=${contractAddress}`,
      `&address=${address}`,
      `&startblock=0&endblock=99999999`,
      `&sort=asc&apikey=${config.apiKeys.blocktrail}`,
    ].join('')

    let transactions

    request.get(url)
      .then((res) => {
        if (res.status) {
          transactions = res.result
            .filter((item) => item.value > 0).map((item) => ({
              confirmations: item.confirmations > 0 ? 'Confirmed' : 'Unconfirmed',
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
          console.log('TOKEN', transactions)
        } else { console.error('res:status ETH false', res) }
      })
  })


const send = (contractAddress, to, amount, decimals) => {
  const { user: { ethData: { address } } } = getState()
  let tokenContract

  const options = {
    from: address,
    gas: `${config.services.web3.gas}`,
    gasPrice: `${config.services.web3.gasPrice}`,
  }

  tokenContract = new web3.eth.Contract(abi, contractAddress, options)

  const newAmount = new BigNumber(String(amount)).times(new BigNumber(10).pow(decimals)).decimalPlaces(decimals).toNumber()

  return new Promise((resolve, reject) =>
    tokenContract.methods.transfer(to, newAmount).send()
      .then(receipt => {
        resolve(receipt)
      })
  )
}

const approve = (contractAddress, amount, decimals, name) => {
  const { user: { ethData: { address } } } = getState()

  const newAmount = new BigNumber(String(amount)).times(new BigNumber(10).pow(decimals)).decimalPlaces(decimals).toNumber()
  const ERC20     = new web3.eth.Contract(abi, contractAddress)

  return new Promise(async (resolve, reject) => {
    try {
      const result = await ERC20.methods.approve(config.token.contract, newAmount).send({
        from: address,
        gas: `${config.services.web3.gas}`,
        gasPrice: `${config.services.web3.gasPrice}`,
      })
        .on('error', err => {
          reject(err)
        })

      resolve(result)
    }
    catch (err) {
      reject(err)
    }
  })
    .then(() => {
      reducers.user.setTokenApprove({ name, approve: true  })
    })
}

const allowance = (contractAddress, name) => {
  const { user: { ethData: { address } } } = getState()
  const ERC20     = new web3.eth.Contract(abi, contractAddress)

  return new Promise(async (resolve, reject) => {
    let allowance = await ERC20.methods.allowance(address, config.token.contract).call()

    console.log('💸 allowance:', allowance)

    reducers.user.setTokenApprove({ name, approve: allowance > 0 })

    resolve(allowance)
  })

}


export default {
  login,
  getBalance,
  getTransaction,
  send,
  fetchBalance,
  approve,
  allowance,
}
