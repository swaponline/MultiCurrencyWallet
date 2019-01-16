export default {
  eth: {
    limit: 21 * 1e3,
    price: {
      slow: 0.1 * 1e9,
      normal: 1 * 1e9,
      fast: 2 * 1e9,
    },
  },
  ethToken: {
    limit: 100 * 1e3,
    price: {
      slow: 0.1 * 1e9,
      normal: 1 * 1e9,
      fast: 2 * 1e9,
    },
  },
  btc: {
    slow: 1 * 1e3,
    normal: 15 * 1e3,
    fast: 30 * 1e3,
  },
  ltc: {
    slow: 1 * 1e3,
    normal: 50 * 1e3,
    fast: 100 * 1e3,
  },
}
