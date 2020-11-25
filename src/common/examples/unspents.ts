import coins from './../coins'

(async () => {
  /*console.log(await coins.GHOST.testnet._connector.fetchUnspents(coins.NEXT.testnet.type, 'XPtT4tJWyepGAGRF9DR4AhRkJWB3DEBXT2'))*/
  //@ts-ignore
  const netType = coins.NEXT.mainnet.type
  const addr = '...'
  //@ts-ignore
  console.log(await coins.NEXT.mainnet._connector.fetchUnspents(netType, addr))

})()
