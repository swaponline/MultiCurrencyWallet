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
        spreadSell: 2,
      },
      {
        amount: 0.005,
        spreadBuy: 4,
        spreadSell: 4,
      },
      {
        amount: 0.05,
        spreadBuy: 8,
        spreadSell: 8,
      },
      {
        amount: 0.5,
        spreadBuy: 16,
        spreadSell: 16,
      },
    ],
  },
  'ETH-NEXT': {
    active: true,
    buy: true,
    sell: true,
    type: 'coin',
    orders: [
      {
        amount: 0.0005,
        spreadBuy: 2,
        spreadSell: 2,
      },
      {
        amount: 0.005,
        spreadBuy: 4,
        spreadSell: 4,
      },
      {
        amount: 0.05,
        spreadBuy: 8,
        spreadSell: 8,
      },
      {
        amount: 0.5,
        spreadBuy: 16,
        spreadSell: 16,
      },
    ],
  },
  'USDT-NEXT': {
    active: true,
    buy: true,
    sell: true,
    type: 'coin',
    orders: [
      {
        amount: 0.0005,
        spreadBuy: 2,
        spreadSell: 2,
      },
      {
        amount: 0.005,
        spreadBuy: 4,
        spreadSell: 4,
      },
      {
        amount: 0.05,
        spreadBuy: 8,
        spreadSell: 8,
      },
      {
        amount: 0.5,
        spreadBuy: 16,
        spreadSell: 16,
      },
    ],
  },
  'USDT-BTC': {
    active: true,
    buy: true,
    sell: true,
    type: 'coin',
    orders: [
      {
        amount: 0.001,
        spreadBuy: 4,
        spreadSell: 4,
      },
      {
        amount: 0.005,
        spreadBuy: 4,
        spreadSell: 4,
      },
      {
        amount: 0.01,
        spreadBuy: 5,
        spreadSell: 5,
      },
      {
        amount: 0.05,
        spreadBuy: 5,
        spreadSell: 5,
      },
      {
        amount: 0.25,
        spreadBuy: 2,
        spreadSell: 2,
      },
    ],
  },
}
