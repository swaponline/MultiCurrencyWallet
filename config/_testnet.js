export default {
  services: {
    web3: {
      provider: 'https://rinkeby.infura.io/JCnK5ifEPH9qcQkX0Ahl',
      rate: 0.1,
      gas: 2e6,
      gasPrice: '20000000000',
    },

    eos: {
      chainId: '038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca',
      httpEndpoint: 'https://jungle.eosio.cr',
    },
  },

  ipfs: {
    swarm: '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star', // '/dns4/discovery.libp2p.array.io/tcp/9091/wss/p2p-websocket-star/'
    server: 'discovery.libp2p.io',
  },

  token: {
    contract: '0xc87C2668F05803F60EF75b176eea0CCE80D0009C',
  },

  eth: {
    contract : '0x4356152f044e3a1ce1a57566b2e0bee57949c1b2', // 0x830aef165b900fa7dc6b219f062c5784f6436d67
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
    bitpay: 'https://test-insight.swap.online/insight',  // https://test-insight.bitpay.com
    etherscan: 'https://rinkeby.etherscan.io',
    eos: 'http://jungle.cryptolions.io/#accountInfo',
  },

  api: {
    blocktrail: 'https://api.blocktrail.com/v1/tBTC',
    bitpay: 'https://test-insight.swap.online/insight-api',  //  https://test-insight.bitpay.com/api https://testnet.y000r.world/insight-api
    etherscan: 'https://rinkeby.etherscan.io/api',
  },

  apiKeys: {
    etherscan: 'RHHFPNMAZMD6I4ZWBZBF6FA11CMW9AXZNM',
    blocktrail: '1835368c0fa8e71907ca26f3c978ab742a7db42e',
  },
}
