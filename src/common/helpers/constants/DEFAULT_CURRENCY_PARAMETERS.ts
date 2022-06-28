export default {
  arbeth: {
    limit: {
      send: 700 * 1e3,
      contractInteract: 10000 * 1e3,
      // ? heed to check how much for swaps ?
      swap: 4000 * 1e3,
    },
    price: {
      slow: 0.1 * 1e8,
      normal: 1 * 1e8,
      fast: 2 * 1e8,
    },
  },
  aureth: {
    limit: {
      send: 42 * 1e3,
      contractInteract: 400 * 1e3,
      // ? heed to check how much for swaps ?
      swap: 140 * 1e3,
    },
    price: {
      slow: 0.1 * 1e7,
      normal: 1 * 1e7,
      fast: 2 * 1e7,
    },
  },
  aurethToken: {
    limit: {
      send: 200 * 1e3,
      swap: 600 * 1e3,
      swapDeposit: 340 * 1e3,
      swapWithdraw: 200 * 1e3,
    },
    price: {
      slow: 0.1 * 1e7,
      normal: 1 * 1e7,
      fast: 2 * 1e7,
    },
  },
  phi: {
    limit: {
      send: 21 * 1e3,
      contractInteract: 200 * 1e3,
      swap: 70 * 1e3,
    },
    price: {
      slow: 100,
      normal: 1000,
      fast: 2000,
    },
  },
  evmLike: {
    limit: {
      send: 21 * 1e3,
      contractInteract: 200 * 1e3,
      swap: 70 * 1e3,
    },
    price: {
      slow: 0.1 * 1e9,
      normal: 1 * 1e9,
      fast: 2 * 1e9,
    },
  },
  evmLikeToken: {
    limit: {
      send: 100 * 1e3,
      swap: 300 * 1e3,
      swapDeposit: 170 * 1e3,
      swapWithdraw: 100 * 1e3,
    },
    price: {
      slow: 0.1 * 1e9,
      normal: 1 * 1e9,
      fast: 2 * 1e9,
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
  ghost: {
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
  next: {
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
