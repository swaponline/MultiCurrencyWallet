
import apiLooper from '../apiLooper'
import { BigNumber } from 'bignumber.js'
import * as next from 'bitcoinjs-lib'

// Use front API config
import { default as TESTNET } from '../../../front/config/testnet/api'
import { default as MAINNET } from '../../../front/config/testnet/api'

const DUST = 546

// Help function - get api by network
const getApiNext = (network) => {
  return {
    name: `apiNextMain`,
    servers: (network === `MAINNET`)
      ? MAINNET.nextExplorer
      : TESTNET.nextExplorer
  }
}

const getApiCustom = (network) => {
  return {
    name: `apiNextCustom`,
    servers: (network === `MAINNET`)
      ? MAINNET.nextExplorerCustom
      : TESTNET.nextExplorerCustom
  }
}

const getCore = () => {
  return next
}

const fetchBalance = (options) => {
  const {
    address,
    API_ENDPOINT, // nextExplorerCustom
    NETWORK,
  } = options


  return apiLooper.get(API_ENDPOINT || getApiNext(NETWORK), `/address/${address}`, {
    checkStatus: (answer) => {
      try {
        if (answer && answer.balance !== undefined) return true
      } catch (e) { /* */ }
      return false
    },
    ignoreErrors: true,
    reportErrors: (answer, onSuccess, onFail) => {
      console.log('>>>> fetchBalance reportErrors')
      console.log(answer)
      onSuccess({ balance: 0 })
      return true
    },
  }).then(({ balance }) => balance)
}

const fetchUnspents = (options) => {
  const {
    address,
    API_ENDPOINT, // nextExplorerCustom
    NETWORK,
  } = options

  return apiLooper.get(API_ENDPOINT || getApiCustom(NETWORK), `/address/${address}/utxo`, { cacheResponse: 5000 })
}

const broadcastTx = (options) => {
  const {
    txRaw,
    API_ENDPOINT, // nextExplorer
    NETWORK,
  } = options

  return apiLooper.post(API_ENDPOINT || getApiNext(NETWORK), `/sendrawtransaction`, {
    body: {
      rawtx: txRaw,
    },
  })
}

const fetchTx = (options) => {
  const {
    hash,
    cacheResponse,
    API_ENDPOINT, // nextExplorer
    NETWORK,
  } = options

  return apiLooper.get(API_ENDPOINT || getApiNext(NETWORK), `/tx/${hash}`, {
    cacheResponse,
    checkStatus: (answer) => {
      try {
        if (answer && answer.txid !== undefined) return true
      } catch (e) { /* */ }
      return false
    },
  }).then(({ fees, ...rest }) => ({
    fees: new BigNumber(fees).multipliedBy(1e8),
    ...rest,
  }))
}

/** to-to - in front has mark (not-working) - need recheck, may be will be fixed **/
const fetchTxInfo = (options) => {
  const {
    hash,
    cacheResponse,
    API_ENDPOINT, // nextExplorer
    hasAdminFee,
    NETWORK,
  } = options

  return fetchTx({
    hash,
    cacheResponse,
    API_ENDPOINT,
    NETWORK,
  }).then((txInfo_ : any) => {
    const { vin, vout, ...rest } = txInfo_
    const senderAddress = vin ? vin[0].address : null
    const amount = vout ? new BigNumber(vout[0].value).toNumber() : null

    let afterBalance = vout && vout[1] ? new BigNumber(vout[1].value).toNumber() : null
    let adminFee: any = false

    if (hasAdminFee) {
      const adminOutput = vout.filter((out) => (
        out.scriptPubKey.addresses
        && out.scriptPubKey.addresses[0] === hasAdminFee.address
        //@ts-ignore: strictNullChecks
        && !(new BigNumber(out.value).eq(amount))
      ))

      const afterOutput = vout.filter((out) => (
        out.addresses
        && out.addresses[0] !== hasAdminFee.address
        && out.addresses[0] !== senderAddress
      ))

      if (afterOutput.length) {
        afterBalance = new BigNumber(afterOutput[0].value).toNumber()
      }

      if (adminOutput.length) {
        adminFee = new BigNumber(adminOutput[0].value).toNumber()
      }
    }

    const txInfo = {
      amount,
      afterBalance,
      senderAddress,
      receiverAddress: vout ? vout[0].scriptPubKey.addresses : null,
      confirmed: !!(rest.confirmations),
      minerFee: rest.fees.dividedBy(1e8).toNumber(),
      adminFee,
      minerFeeCurrency: 'NEXT',
      outputs: vout.map((out) => ({
        amount: new BigNumber(out.value).toNumber(),
        address: out.scriptPubKey.addresses || null,
      })),
      inputs: vin.map((input) => ({
        amount: new BigNumber(input.value).toNumber(),
        script: input.scriptSig.hex || null,
      })),
      ...rest,
    }

    return txInfo
  })
}

const checkWithdraw = (options) => {
  const {
    scriptAddress,
    API_ENDPOINT, // nextExplorerCustom
    NETWORK,
  } = options

  return apiLooper.get(API_ENDPOINT || getApiCustom(NETWORK), `/txs/${scriptAddress}`, {
    checkStatus: (answer) => {
      try {
        if (answer && answer.txs !== undefined) return true
      } catch (e) { /* */ }
      return false
    },
    query: 'next_balance',
  }).then((res : any) => {
    if (res.txs.length > 1
      && res.txs[0].vout.length
    ) {
      const address = res.txs[0].vout[0].scriptPubKey.addresses[0]
      const amount = res.txs[0].vout[0].valueSat

      const {
        txid,
      } = res.txs[0]
      return {
        address,
        txid,
        amount,
      }
    }
    return false
  })
}

const fetchTxInputScript = (options) => {
  const {
    hash,
    cacheResponse,
    API_ENDPOINT,
    NETWORK,
  } = options

  return fetchTxInfo({
    hash,
    cacheResponse,
    API_ENDPOINT,
    NETWORK,
  }).then((inInfo: any) => {
    if (inInfo
      && inInfo.inputs
      && inInfo.inputs.length === 1
    ) {
      return next.script.toASM(
        //@ts-ignore: strictNullChecks
        next.script.decompile(
          Buffer.from(inInfo.inputs[0].script, 'hex')
        )
      )
    }
    return false
  })
}

const calculateTxSize = async (options) => {
  const {
    speed,
    unspents: _unspents,
    address,
    txOut = 2,
    fixed,
    NETWORK,
  } = options

  const defaultTxSize = 400

  if (fixed) {
    return defaultTxSize
  }

  const unspents = _unspents || await fetchUnspents({
    address,
    NETWORK,
  })


  const txIn = unspents.length
  const txSize = txIn > 0
    ? txIn * 146 + txOut * 33 + (15 + txIn - txOut)
    : defaultTxSize

  return txSize
}

const estimateFeeValue = async (options) => {
  const {
    feeRate: _feeRate,
    inSatoshis,
    speed,
    address,
    txSize: _txSize,
    fixed,
    method,
    NETWORK,
  } = options

  const txOut = 2


  const txSize = _txSize || await calculateTxSize({
    address,
    speed,
    fixed,
    method,
    txOut,
    NETWORK,
  })

  const feeRate = _feeRate  || 30 * 1e3 // fast

  const calculatedFeeValue = BigNumber.maximum(
    DUST,
    new BigNumber(feeRate)
      .multipliedBy(txSize)
      .div(1024)
      .dp(0, BigNumber.ROUND_HALF_EVEN),
  )

  // Используем комиссию больше рекомендованной на 5 сатоши
  calculatedFeeValue.plus(20)

  const finalFeeValue = inSatoshis
    ? calculatedFeeValue.toString()
    : calculatedFeeValue.multipliedBy(1e-8).toString()

  console.log(`Next withdraw fee speed(${speed}) method (${method}) ${finalFeeValue}`)
  return finalFeeValue
}

const networks = {
  mainnet: {
    messagePrefix: 'Nextcoin Signed Message:\n',
    bip32: {
      public:  0x0488B21E,
      private: 0x0488ADE4,
    },
    pubKeyHash: 75,
    scriptHash: 5,
    wif: 128,
  },
  testnet: {
    messagePrefix: 'Nextcoin Signed Message:\n',
    bip32: {
      public:  0x0488B21E,
      private: 0x0488ADE4,
    },
    pubKeyHash: 75,
    scriptHash: 5,
    wif: 128,
  },
}

export default {
  fetchBalance,
  fetchUnspents,
  broadcastTx,
  fetchTx,
  fetchTxInfo,
  checkWithdraw,
  fetchTxInputScript,

  estimateFeeValue,
  getCore,
  networks,
}