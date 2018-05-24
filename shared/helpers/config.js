const config = {
  api: {
    // bitcoin data
    blocktrail: 'https://api.blocktrail.com/v1/tBTC',
    bitpay: 'https://test-insight.bitpay.com/api',
    ethpay: 'https://rinkeby.etherscan.io/api',
  },
  apiKeys: {
    // etherscan.io
    blocktrail: '1835368c0fa8e71907ca26f3c978ab742a7db42e',
  },
  token: {
    rate:0.1,
    noxonToken: '0x60c205722c6c797c725a996cf9cca11291f90749',
    gas: 1e5,
    gasPrice: '20000000000',
  },
  date: {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  },
}

export default config
