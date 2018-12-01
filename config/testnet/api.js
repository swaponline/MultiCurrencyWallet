export default {
  blocktrail: 'https://api.blocktrail.com/v1/tBTC',
  bitpay: 'https://test-insight.swap.online/insight-api/',
  etherscan: 'https://rinkeby.etherscan.io/api',
  bch: 'https://bch-insight.bitpay.com/api',
  ltc: 'https://ltctest.coinapp.io/api',
  eos: {
    chainId: '038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca',
    httpEndpoint: 'https://jungle.eosio.cr',
    registerEndpoint: 'https://seven.swap.online/eos-testnet/buyaccount',
    buyAccountPriceInBTC: 0.01,
    buyAccountPaymentRecipient: 'mnCLLbtNuXfmHHbDunyjqj61o63XjxNCpG'
  },
  telos: {
    chainId: '6c8aacc339bf1567743eb9c8ab4d933173aa6dca4ae6b6180a849c422f5bb207',
    httpEndpoint: 'https://seven.swap.online/telos-endpoint',
    registerEndpoint: 'https://seven.swap.online/telos-testnet/newaccount'
  }
}
