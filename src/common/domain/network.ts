export const networkType = Object.freeze({
  mainnet: 'mainnet', // all 'costs something' cases
  testnet: 'testnet', // all 'costs nothing' cases
})

export enum Networks {
  mainnet = 'mainnet',
  testnet = 'testnet',
}

export const getNetworkType = (name: string): Networks => {
  switch(name.toLowerCase()) {
    case `mainnet`: return Networks.mainnet
    case `testnet`: return Networks.testnet
  }
  throw new Error('Unknown network')
}
