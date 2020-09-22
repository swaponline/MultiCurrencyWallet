// Private Keys ---------------------------------------------- /

// Chrome
// localStorage.setItem('ethPrivateKey', '0xa6316e9e231fa70f2f41ce755f3846b74af10e8c5def8d333ec89af3b9b4193b')
// localStorage.setItem('btcPrivateKey', 'cUSH65TpCkU5rsMem8WND5itr3SVF192EAKA8E5ipqs15fTJiRbc')

// Yandex
// localStorage.setItem('ethPrivateKey', '0xe32a5cb068a13836b6bc80f54585bbfcc2d5d9089f0c5381b27d039b6d2404ec')
// localStorage.setItem('btcPrivateKey', 'cRF7Az481ffsuhhZ28x32Xk4ZvPh98zhKv7hCi1pKjifqvv7AcuX')

const localClear = localStorage.clear.bind(localStorage)
const config = {
  services: {
    web3: {
      provider: 'https://rinkeby.infura.io/JCnK5ifEPH9qcQkX0Ahl',
      rate: 0.1,
      gas: 2e6,
      gasPrice: '20000000000',
    },
  },

  token: {
    contract: '0xc87C2668F05803F60EF75b176eea0CCE80D0009C',
  },

  eth: {
    contract : '0x830aef165b900fa7dc6b219f062c5784f6436d67', // 0xdbC2395f753968a93465487022B0e5D8730633Ec
  },

  tokens: {
    swap: {
      address: '0xbaa3fa2ed111f3e8488c21861ea7b7dbb5a7b121',
      decimals: 18,
    },
    noxon: {
      address: '0x60c205722c6c797c725a996cf9cca11291f90749',
      decimals: 0,
    },
    jot: {
      address: '0x9070e2fDb61887c234D841c95D1709288EBbB9a0',
      decimals: 18,
    },
  },

  link: {
    bitpay: 'https://test-insight.bitpay.com',
    etherscan: 'https://rinkeby.etherscan.io',
  },

  api: {
    blocktrail: 'https://api.blocktrail.com/v1/tBTC',
    bitpay: 'https://test-insight.bitpay.com/api',
    etherscan: 'https://rinkeby.etherscan.io/api',
  },

  apiKeys: {
    etherscan: 'RHHFPNMAZMD6I4ZWBZBF6FA11CMW9AXZNM',
    blocktrail: '1835368c0fa8e71907ca26f3c978ab742a7db42e',
  },
};
window.clear = localStorage.clear = () => {
  const testnetEthPrivateKey = localStorage.getItem('testnet:eth:PrivateKey')
  const testnetBtcPrivateKey = localStorage.getItem('testnet:btc:PrivateKey')
  const mainnetEthPrivateKey = localStorage.getItem('mainnet:eth:PrivateKey')
  const mainnetBtcPrivateKey = localStorage.getItem('mainnet:btc:PrivateKey')

  localClear()

  localStorage.getItem('testnet:eth:PrivateKey', testnetEthPrivateKey)
  localStorage.getItem('testnet:btc:PrivateKey', testnetBtcPrivateKey)
  localStorage.getItem('mainnet:eth:PrivateKey', mainnetEthPrivateKey)
  localStorage.getItem('mainnet:btc:PrivateKey', mainnetBtcPrivateKey)
}



// Swap ------------------------------------------------------ /
window._web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/JCnK5ifEPH9qcQkX0Ahl'));
window.swap.core.app.setup({
  network: 'testnet',
  env: {
    web3 : window._web3,
    bitcoin : window.BitCoinJSLib,
    Ipfs: window.Ipfs,
    IpfsRoom: window.IpfsRoom,
    storage: window.localStorage,
  },
  services: [
    new window.swap.core.auth({
      eth: '0xe8e73c3f411bce5ea0fe7fdd5da0b456488aa763f4bc638ca5f4a7d5ff55c01f', // or pass private key here
      btc: 'cTD1xQMqG19968ZLetmHb9NJr5oaJBotbcRwvcaYZuJThvYEDEr9',
    }),
    new window.swap.core.room({
      EXPERIMENTAL: {
        pubsub: true,
      },
      config: {
        Addresses: {
          Swarm: [
            '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
            '/dns4/star.wpmix.net/tcp/443/wss/p2p-websocket-star',
          ],
        },
      },
    }),
    new window.swap.core.orders(),
  ],
  swaps: [
    new window.swap.core.swaps.EthSwap({
      address: '0xe08907e0e010a339646de2cc56926994f58c4db2',
      abi: [ { "constant": false, "inputs": [ { "name": "_ownerAddress", "type": "address" } ], "name": "abort", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_participantAddress", "type": "address" } ], "name": "close", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_secretHash", "type": "bytes20" }, { "name": "_participantAddress", "type": "address" } ], "name": "createSwap", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_participantAddress", "type": "address" } ], "name": "refund", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_ratingContractAddress", "type": "address" } ], "name": "setReputationAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_participantAddress", "type": "address" } ], "name": "sign", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "constant": false, "inputs": [ { "name": "_secret", "type": "bytes32" }, { "name": "_ownerAddress", "type": "address" } ], "name": "withdraw", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "_ownerAddress", "type": "address" } ], "name": "checkSign", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_ownerAddress", "type": "address" }, { "name": "_participantAddress", "type": "address" } ], "name": "getInfo", "outputs": [ { "name": "", "type": "bytes32" }, { "name": "", "type": "bytes20" }, { "name": "", "type": "uint256" }, { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_participantAddress", "type": "address" } ], "name": "getSecret", "outputs": [ { "name": "", "type": "bytes32" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" }, { "name": "", "type": "address" } ], "name": "participantSigns", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "ratingContractAddress", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" }, { "name": "", "type": "address" } ], "name": "swaps", "outputs": [ { "name": "secret", "type": "bytes32" }, { "name": "secretHash", "type": "bytes20" }, { "name": "createdAt", "type": "uint256" }, { "name": "balance", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_ownerAddress", "type": "address" }, { "name": "_participantAddress", "type": "address" } ], "name": "unsafeGetSecret", "outputs": [ { "name": "", "type": "bytes32" } ], "payable": false, "stateMutability": "view", "type": "function" } ],
      fetchBalance: (address) => {},
    }),
	new window.swap.core.swaps.EthTokenSwap({
		name: window.swap.core.constants.COINS.noxon,
		address: config.token.contract,
		decimals: config.tokens.noxon.decimals,
		abi: [{"constant":false,"inputs":[{"name":"_secret","type":"bytes32"},{"name":"_ownerAddress","type":"address"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_participantAddress","type":"address"}],"name":"getSecret","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_ratingContractAddress","type":"address"}],"name":"setReputationAddress","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"participantSigns","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_ownerAddress","type":"address"}],"name":"abort","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"swaps","outputs":[{"name":"token","type":"address"},{"name":"secret","type":"bytes32"},{"name":"secretHash","type":"bytes20"},{"name":"createdAt","type":"uint256"},{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_secretHash","type":"bytes20"},{"name":"_participantAddress","type":"address"},{"name":"_value","type":"uint256"},{"name":"_token","type":"address"}],"name":"createSwap","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_ownerAddress","type":"address"}],"name":"checkSign","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_participantAddress","type":"address"}],"name":"close","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"ratingContractAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_participantAddress","type":"address"}],"name":"sign","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_ownerAddress","type":"address"}],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_participantAddress","type":"address"}],"name":"refund","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[],"name":"Sign","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"createdAt","type":"uint256"}],"name":"CreateSwap","type":"event"},{"anonymous":false,"inputs":[],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[],"name":"Close","type":"event"},{"anonymous":false,"inputs":[],"name":"Refund","type":"event"},{"anonymous":false,"inputs":[],"name":"Abort","type":"event"}],
		tokenAddress: config.tokens.noxon.address,
		tokenAbi: [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_amount","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"getBurnPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"manager","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"unlockEmission","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"emissionlocked","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"acceptOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"lockEmission","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"burnAll","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_newManager","type":"address"}],"name":"changeManager","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"changeOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"emissionPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"addToReserve","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"burnPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"tokenAddress","type":"address"},{"name":"amount","type":"uint256"}],"name":"transferAnyERC20Token","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"NoxonInit","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"acceptManagership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"buyer","type":"address"},{"indexed":false,"name":"ethers","type":"uint256"},{"indexed":false,"name":"_emissionedPrice","type":"uint256"},{"indexed":false,"name":"amountOfTokens","type":"uint256"}],"name":"TokenBought","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"buyer","type":"address"},{"indexed":false,"name":"ethers","type":"uint256"},{"indexed":false,"name":"_burnedPrice","type":"uint256"},{"indexed":false,"name":"amountOfTokens","type":"uint256"}],"name":"TokenBurned","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"etherReserved","type":"uint256"}],"name":"EtherReserved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}],
		fetchBalance: (address) => actions.token.fetchBalance(address),
	  }),
    new window.swap.core.swaps.BtcSwap({
      fetchBalance: (address) => {},
      fetchUnspents: (scriptAddress) => {},
      broadcastTx: (txRaw) => {},
    }),
  ],
  flows: [
      window.swap.core.flows.ETH2BTC,
      window.swap.core.flows.BTC2ETH,
	  window.swap.core.flows.ETHTOKEN2BTC(window.swap.core.constants.COINS.noxon),
      window.swap.core.flows.BTC2ETHTOKEN(window.swap.core.constants.COINS.noxon),
	  window.swap.core.flows.ETHTOKEN2BTC(window.swap.core.constants.COINS.swap),
      window.swap.core.flows.BTC2ETHTOKEN(window.swap.core.constants.COINS.swap),
  ]
})


console.log(333, window.swap.core.app)
