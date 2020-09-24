const coins = require('./../coins');


const tests = [

  //btc
  {
    check: true,
    coin: 'BTC',
    network: 'mainnet',
    address: '1EPTHasxZ1Hx6tBb8qfLZ3hAEr45y9viU9',
    isCoins: false,
  },
  {
    check: true,
    coin: 'BTC',
    network: 'mainnet',
    address: '3JurbUwpsAPqvUkwLM5CtwnEWrNnUKJNoD',
    isCoins: true,
  },
  {
    check: true,
    coin: 'BTC',
    network: 'testnet',
    address: '2N3pDTovNkg5QqgkMttjwekPNBZo3m7XfGZ',
    isCoins: false,
  },
  {
    check: true,
    coin: 'BTC',
    network: 'testnet',
    address: 'mkHS9ne12qx9pS9VojpwU5xtRd4T7X7ZUt',
    isCoins: true,
  },

  // ghost
  {
    check: false,
    coin: 'GHOST',
    network: 'testnet',
    address: 'XPtT4tJWyepGAGRF9DR4AhRkJWB3DEBXT2',
    isCoins: false,
  },
  {
    check: false,
    coin: 'GHOST',
    network: 'testnet',
    address: 'Xa6SpohTZZAKrbqoZjSFkPY34hbCZJy9RG',
    isCoins: true,
  },
  {
    check: true,
    coin: 'GHOST',
    network: 'mainnet',
    address: 'GSU22kfQ2esX85pii4a7MJ47x1VPQ6wAhU',
    isCoins: false,
  },
  {
    check: true,
    coin: 'GHOST',
    network: 'mainnet',
    address: 'GgWNhjFhSCBDfw85vPvXZyqXXrEqVFSSvB',
    isCoins: true,
  },

  // next
  {
    check: true,
    coin: 'NEXT',
    network: 'mainnet',
    address: 'XZUsFMpkgPjjfT1c9CwKKyY4TzdQhiKNju',
    isCoins: false,
  },
  {
    check: true,
    coin: 'NEXT',
    network: 'mainnet',
    address: 'XMkvVVvuQJp4mp5hoVHUPumbnvh63xJsN4',
    isCoins: true,
  },
];

(async () => {
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    if (!test.check) {
      continue
    }
    const { coin, network, address, isCoins } = test;
    console.log(`Test: getBalance, ${coin} ${network}, balance ${isCoins ? '> 0' : '= 0'}`)
    balance = await coins[coin][network].getBalance(address)
    //console.log(balance)
    if ((balance > 0) == isCoins) {
      console.log('OK')
    } else {
      console.log(`(!!!) FAIL, address ${address} expected ${isCoins ? '>0' : '0'}, received ${balance}`)
    }
  }
})()
