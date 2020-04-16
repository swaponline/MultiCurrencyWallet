export default {
  eth: {
    limit: {
      send: 21 * 1e3,
      swap: 150 * 1e3,
    },
    price: {
      slow: 0.1 * 1e9,
      normal: 1 * 1e9,
      fast: 2 * 1e9,
    },
  },
  ethToken: {
    limit: {
      send: 100 * 1e3,
      swap: 300 * 1e3,
    },
    price: {
      slow: 0.1 * 1e9,
      normal: 1 * 1e9,
      fast: 2 * 1e9,
    },
  },
  bch: {
    size: {
      send: 226,
      swap: 1024,
    },
    rate: {
      slow: 10 * 1e3,
      normal: 50 * 1e3,
      fast: 100 * 1e3,
    },
  },
  btc: {
    size: {
      send: 226,
      swap: 400,
    },
    rate: {
      slow: 5 * 1e3,
      normal: 15 * 1e3,
      fast: 30 * 1e3,
    },
  },
}
