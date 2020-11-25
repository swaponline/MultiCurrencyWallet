import coins from './../coins'


(async () => {

/*
  // create account
  const mnemonic = 'praise you muffin lion enable neck grocery crumble super myself license ghost'
  const account = coins.GHOST.testnet.accountFromMnemonic(mnemonic)
  //console.log('account =', account)
  //console.log('address =', account.address.toString())

  // create TX
  const amount = 1 * (10 ** coins.GHOST.precision) // 1 Ghost coin
  const to = 'XPtT4tJWyepGAGRF9DR4AhRkJWB3DEBXT2';
  const rawTx = await coins.GHOST.testnet.createTx({ account, amount, to })
  console.log('GHOST tx created:', rawTx)

  // publish TX
  // const txid = await coins.GHOST.testnet.publishTx(rawTx)
  // console.log('tx sended, txid =', txid)

  // show TX URL
  // const txUrl = coins.GHOST.testnet.getTxUrl(txid)
  // console.log('txUrl =', txUrl)
*/


  // NEXT

  // create account
  const mnemonic = '...'
  //@ts-ignore
  const account = coins.NEXT.mainnet.accountFromMnemonic(mnemonic)

  // create TX
  const amount = 1 * (10 ** coins.NEXT.precision) // 1 Ghost coin
  const to = '...'
  //@ts-ignore
  const rawTx = await coins.NEXT.mainnet.createTx({ account, amount, to })
  console.log('NEXT tx created:', rawTx)

  // publish TX
  //@ts-ignore
  const txid = await coins.NEXT.mainnet.publishTx(rawTx)
  console.log('tx sended, txid =', txid)

  if (txid) { // show TX URL
    //@ts-ignore
    const txUrl = coins.NEXT.mainnet.getTxUrl(txid)
    console.log('txUrl =', txUrl)
  }


})()
