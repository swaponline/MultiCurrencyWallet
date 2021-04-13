import * as bitcoin from 'bitcoinjs-lib'
import constants from 'common/helpers/constants'
import DEFAULT_CURRENCY_PARAMETERS from 'helpers/constants/DEFAULT_CURRENCY_PARAMETERS'


enum Network {
  mainnet = "mainnet",
  testnet = "testnet",
}

enum AddressType {
  p2pkh = "P2PKH",
  p2sh = "P2SH",
  p2wpkh = "P2WPKH",
  p2wsh = "P2WSH",
}

const addressTypes: { [key: number]: { type: AddressType, network: Network } } = {
  0x00: {
    type: AddressType.p2pkh,
    network: Network.mainnet,
  },

  0x6f: {
    type: AddressType.p2pkh,
    network: Network.testnet,
  },

  0x05: {
    type: AddressType.p2sh,
    network: Network.mainnet,
  },

  0xc4: {
    type: AddressType.p2sh,
    network: Network.testnet,
  },
};

const getAddressType = (address: string) => {
  const prefix = address.substr(0, 2);
  let version;
  let data;
  let addressType;

  if (prefix === 'bc' || prefix === 'tb') {
  const { data: benchVersion } = bitcoin.address.fromBech32(address)
  data = benchVersion;
  return addressType = data.length === 20 ? AddressType.p2wpkh : AddressType.p2wsh;

  } else {
  const { version: baseVersion } = bitcoin.address.fromBase58Check(address)
  version = baseVersion
  let { type } = addressTypes[version]
  if (!type) {
  type = AddressType.p2pkh;
  console.warn(`Unknown version '${version}' for address '${address}'.`)
  }
  return addressType = type || AddressType.p2pkh
  }
}
// getByteCount({'MULTISIG-P2SH:2-4':45},{'P2PKH':1}) Means "45 inputs of P2SH Multisig and 1 output of P2PKH"
// getByteCount({'P2PKH':1,'MULTISIG-P2SH:2-3':2},{'P2PKH':2}) means "1 P2PKH input and 2 Multisig P2SH (2 of 3) inputs along with 2 P2PKH outputs"
const getByteCount = (inputs, outputs) => {
const { TRANSACTION } = constants
let totalWeight = 0
let hasWitness = false
let inputCount = 0
let outputCount = 0
// assumes compressed pubkeys in all cases.
const types = {
  'inputs': {
    'MULTISIG-P2SH': TRANSACTION.MULTISIG_P2SH_IN_SIZE * 4,
    'MULTISIG-P2WSH': TRANSACTION.MULTISIG_P2WSH_IN_SIZE + (41 * 4),
    'MULTISIG-P2SH-P2WSH': TRANSACTION.MULTISIG_P2SH_P2WSH_IN_SIZE + (76 * 4),
    'P2PKH': TRANSACTION.P2PKH_IN_SIZE * 4,
    'P2WPKH': TRANSACTION.P2WPKH_IN_SIZE + (41 * 4),
    'P2SH-P2WPKH': TRANSACTION.P2SH_P2WPKH_IN_SIZE + (64 * 4),
  },
  'outputs': {
    'P2SH': TRANSACTION.P2SH_OUT_SIZE * 4,
    'P2PKH': TRANSACTION.P2PKH_OUT_SIZE * 4,
    'P2WPKH': TRANSACTION.P2WPKH_OUT_SIZE * 4,
    'P2WSH': TRANSACTION.P2WSH_OUT_SIZE * 4,
  },
}

const checkUInt53 = (n) => {
  if (n < 0 || n > Number.MAX_SAFE_INTEGER || n % 1 !== 0) throw new RangeError('value out of range')
}

const varIntLength = (number) => {
  checkUInt53(number)

  return (
  number < 0xfd ? 1
    : number <= 0xffff ? 3
    : number <= 0xffffffff ? 5
      : 9
  )
}

Object.keys(inputs).forEach((key) => {
  checkUInt53(inputs[key])
  if (key.slice(0, 8) === 'MULTISIG') {
    // ex. "MULTISIG-P2SH:2-3" would mean 2 of 3 P2SH MULTISIG
    const keyParts = key.split(':')
    if (keyParts.length !== 2) throw new Error(`invalid input: ${key}`)
    const newKey = keyParts[0]
    const mAndN = keyParts[1].split('-').map((item) => parseInt(item))

    totalWeight += types.inputs[newKey] * inputs[key]
    const multiplyer = (newKey === 'MULTISIG-P2SH') ? 4 : 1
    totalWeight += ((73 * mAndN[0]) + (34 * mAndN[1])) * multiplyer * inputs[key]
  } else {
    totalWeight += types.inputs[key] * inputs[key]
  }
  inputCount += inputs[key]
  if (key.indexOf('W') >= 0) hasWitness = true
})

Object.keys(outputs).forEach((key) => {
  checkUInt53(outputs[key])
  totalWeight += types.outputs[key] * outputs[key]
  outputCount += outputs[key]
})

if (hasWitness) totalWeight += 2

totalWeight += 8 * 4
totalWeight += varIntLength(inputCount) * 4
totalWeight += varIntLength(outputCount) * 4

return Math.ceil(totalWeight / 4)
}

type CalculateTxSizeParams = {
  txIn?: number
  txOut?: number
  method?: string
  fixed?: boolean
  toAddress?: string
  serviceFee?: {
    address: any
    min: any
    fee: any
  } | any
  address?: string
}

const calculateTxSize = async (params: CalculateTxSizeParams) => {
  let {
    txIn,
    txOut,
    method = 'send',
    fixed,
    toAddress,
    serviceFee,
    address,
  } = params

  const { TRANSACTION } = constants
  const defaultTxSize = DEFAULT_CURRENCY_PARAMETERS.btc.size[method]

  let txSize = defaultTxSize

  if (fixed) {
    return txSize
  }
  const fromAddressType = address ? getAddressType(address) : "P2PKH";

  // general formula
  // (<one input size> × <number of inputs>) + (<one output size> × <number of outputs>) + <tx size>
  if (txIn > 0) {
    txSize =
    txIn * TRANSACTION[`${fromAddressType}_IN_SIZE`] +
    txOut * TRANSACTION.P2PKH_OUT_SIZE +
    (TRANSACTION.TX_SIZE + txIn - txOut)

    if (method === 'swap' && txSize < 300){
      txSize = defaultTxSize
    }
  }

  if (method === 'send_multisig') {
    let outputs = {
      'P2SH': 1,
    }
    const toAddressType = toAddress ? getAddressType(toAddress) : "P2PKH";
    outputs[toAddressType] = ++outputs[toAddressType] || 1;

    if (serviceFee) {
      const adminAddressType = getAddressType(serviceFee.address);
      outputs[adminAddressType] = ++outputs[adminAddressType] || 1;
    }
    txSize = getByteCount(
      { 'MULTISIG-P2SH:2-2': 1 },
      outputs
    )
  }

  if (method === 'send_2fa') {
    let outputs = {
      'P2SH': 1,
    }
    const toAddressType = toAddress ? getAddressType(toAddress) : "P2PKH";
    outputs[toAddressType] = ++outputs[toAddressType] || 1;

    if (serviceFee) {
      const adminAddressType = getAddressType(serviceFee.address);
      outputs[adminAddressType] = ++outputs[adminAddressType] || 1;
    }
    txSize = getByteCount(
      { 'MULTISIG-P2SH:2-3': txIn },
      outputs
    )
  }

  console.group('Common > helpers >%c btc > calculateTxSize', 'color: green;')
  console.log('params: ', params)
  console.log('txSize: ', txSize)
  console.groupEnd()

  return txSize
}


export default {
  calculateTxSize,
}