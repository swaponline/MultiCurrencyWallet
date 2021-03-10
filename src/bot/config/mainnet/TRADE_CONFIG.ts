/*

  Example how is used spread:

           / 100 - spread[%] \
  price * |  –––––––––––––––  |
           \       100       /

  Example of orders config:

  'ETH-BTC': {
    active: true,
    buy: true,
    sell: true,
    type: 'coin',
    orders: [
      {
        amount: 0.0005, // must be greater than 0
        buy: true,      // default true
        sell: true,     // default true
        spreadBuy: 2,   // must be greater than 0
        spreadSell: 2,  // must be greater than 0
      },
    ],
  }

 */


export default {
  'ETH-BTC': {
    active: true,
    buy: true,
    sell: true,
    type: 'coin',
    orders: [
      {
        amount: 0.0005,
        spreadBuy: 2,
        spreadSell: 2
      },
      {
        amount: 0.005,
        spreadBuy: 4,
        spreadSell: 4
      },
      {
        amount: 0.05,
        spreadBuy: 8,
        spreadSell: 8
      },
      {
        amount: 0.5,
        spreadBuy: 16,
        spreadSell: 16
      },
    ],
  },
  'SWAP-BTC': {
    active: true,
    buy: true,
    sell: true,
    type: 'coin',
    orders: [
      {
        amount: 0.0001,
        spreadBuy: 93.25,
        spreadSell: 4
      },
      {
        amount: 0.0005,
        spreadBuy: 93.25,
        spreadSell: 4
      },
      {
        amount: 0.005,
        spreadBuy: 93.25,
        spreadSell: 4
      }
    ],
  },
  'USDT-BTC': {
    active: true,
    buy: true,
    sell: true,
    type: 'coin',
    orders: [
      {
        amount: 0.005,
        spreadBuy: 4,
        spreadSell: 4
      },
      {
        amount: 0.01,
        spreadBuy: 5,
        spreadSell: 5
      },
      {
        amount: 0.05,
        spreadBuy: 5,
        spreadSell: 5
      },
      {
        amount: 0.25,
        spreadBuy: 2,
        spreadSell: 2,
      }
    ],
  },
  'JACK-BTC': {
    active: true,
    buy: false,
    sell: true,
    type: 'coin',
    orders: [
      {
        amount: 0.01,
        spreadBuy: 1,
        spreadSell: 1
      },
      {
        amount: 0.02,
        spreadBuy: 1,
        spreadSell: 1
      }
    ],
  },
  'JOT-BTC' : {
    active: false,
    buy: false,
    sell: false,
    type: 'coin',
    orders: [
      {
        amount: 0.0005,
        spreadBuy: 50,
        spreadSell: 50
      },
      {
        amount: 0.005,
        spreadBuy: 60,
        spreadSell: 60
      },
      {
        amount: 0.05,
        spreadBuy: 70,
        spreadSell: 70
      },
      {
        amount: 0.5,
        spreadBuy: 80,
        spreadSell: 80
      },
    ],
  },
  'SNM-BTC' : {
    active: true,
    buy: true,
    sell: false,
    type: 'coin',
    orders: [
      {
        amount: 0.0005,
        spreadBuy: 2,
        spreadSell: 2
      },
      {
        amount: 0.005,
        spreadBuy: 4,
        spreadSell: 4
      },
      {
        amount: 0.05,
        spreadBuy: 8,
        spreadSell: 8
      },
      {
        amount: 0.5,
        spreadBuy: 16,
        spreadSell: 16
      },
    ],
  },
  'WBTC-BTC' : {
    active : true,
    buy: true,
    sell: true,
    type: 'coin',
    orders: [
      {
        amount: 0.005,
        spreadBuy: 1,
        spreadSell: 1
      },
      {
        amount: 0.01,
        spreadBuy: 1,
        spreadSell: 1
      },
      {
        amount: 0.05,
        spreadBuy: 1,
        spreadSell: 1
      },
      {
        amount: 0.25,
        spreadBuy: 1,
        spreadSell: 1,
      }
    ],
  },
  'XSAT-BTC': {
    active: true,
    buy: false,
    sell: true,
    type: 'coin',
    orders: [
      {
        amount: 0.0005,
        spreadBuy: 2,
        spreadSell: 2
      },
      {
        amount: 0.005,
        spreadBuy: 4,
        spreadSell: 4
      },
      {
        amount: 0.05,
        spreadBuy: 8,
        spreadSell: 8
      },
      {
        amount: 0.5,
        spreadBuy: 16,
        spreadSell: 16
      },
    ],
  },
  'HDP-BTC': {
    active: true,
    buy: false,
    sell: true,
    sellPrice: 0.00035,
    orders: [
      {
        amount: 0.0005,
        spreadBuy: 2,
        spreadSell: 2
      },
      {
        amount: 0.005,
        spreadBuy: 4,
        spreadSell: 4
      },
      {
        amount: 0.05,
        spreadBuy: 8,
        spreadSell: 8
      },
      {
        amount: 0.5,
        spreadBuy: 16,
        spreadSell: 16
      },
    ],
  },
}
