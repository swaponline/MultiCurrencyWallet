import abi from 'human-standard-token-abi'
import { request } from 'helpers'
import { getState } from 'redux/core'
import actions from 'redux/actions'
import web3 from 'helpers/web3'
import reducers from 'redux/core/reducers'
import config from 'app-config'
import { BigNumber } from 'bignumber.js'


BigNumber.config({ RANGE: [-1e+9, 1e+9], POW_PRECISION: 0  })

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
    name: nameContract.toLowerCase(),
    fullName: nameContract.toLowerCase(),
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

  const result = await ERC20.methods.balanceOf(address).call()
  console.log('result get balance', result)
  let amount = new BigNumber(String(result)).dividedBy(new BigNumber(String(10)).pow(decimals)).toNumber()

  reducers.user.setTokenBalance({ name, amount })
  return amount
}


const fetchBalance = async (address, contractAddress, decimals) => {

  const ERC20 = new web3.eth.Contract(abi, contractAddress)
  const result = await ERC20.methods.balanceOf(address).call()

  const amount = new BigNumber(String(result)).dividedBy(new BigNumber(String(10)).pow(decimals)).toNumber()
  return amount
}

const getTransaction = (currency) =>
  new Promise((resolve) => {
    const { user: { tokensData } } = getState()

    if (currency === undefined) {
      return
    }

    const { address, contractAddress } = tokensData[currency.toLowerCase()]

    console.log('swap', address, contractAddress)

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


const send = (contractAddress, to, amount, decimals) => {
  const { user: { ethData: { address } } } = getState()

  const options = {
    from: address,
    gas: 1e5,
    gasPrice: 21e9,
  }

  const tokenContract = new web3.eth.Contract(abi, contractAddress, options)
  const newAmount = new BigNumber(String(amount)).times(new BigNumber(10).pow(decimals)).integerValue()

  return new Promise(async (resolve, reject) => {
    const receipt = await tokenContract.methods.transfer(to, newAmount).send()
      .on('transactionHash', (hash) => {
        const txId = `${config.link.etherscan}/tx/${hash}`
        actions.loader.show(true, true, txId)
      })
      .on('error', (err) => {
        reject(err)
      })

    resolve(receipt)
  })
}

const approve = (name, amount) => {
  const { user: { tokensData } } = getState()
  const { address, contractAddress, decimals } = tokensData[name.toLowerCase()]


  const newAmount = new BigNumber(String(amount)).times(new BigNumber(10).pow(decimals)).integerValue()
  const ERC20     = new web3.eth.Contract(abi, contractAddress)

  return new Promise(async (resolve, reject) => {
    try {
      const result = await ERC20.methods.approve(config.token.contract, newAmount).send({
        from: address,
        gas: 1e5,
        gasPrice: 21e9,
      })
        .on('transactionHash', (hash) => {
          const txId = `${config.link.etherscan}/tx/${hash}`
          actions.loader.show(true, true, txId)
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
      reducers.user.setTokenApprove({ name: name.toLowerCase(), approve: true  })
    })
}

const allowance = (contractAddress, name) => {
  const { user: { ethData: { address } } } = getState()
  const ERC20     = new web3.eth.Contract(abi, contractAddress)

  return new Promise(async (resolve, reject) => {
    let allowance = await ERC20.methods.allowance(address, config.swapContract.erc20).call()

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
