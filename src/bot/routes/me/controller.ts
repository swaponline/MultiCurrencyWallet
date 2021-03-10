import swapApp from '../../swapApp'


const wallet = swapApp.wallet

const getMe = async (req, res) => {
  res.json({
    wallet: wallet.view(),
    balance: await wallet.getBalance()
  })
}

const getWallet = (req, res) => {
  res.json(wallet.view())
}

const getWalletDetailed = async (req, res) => {
  // wallet.detailedView().then((view) => res.json(view))
  res.json(await wallet.detailedView())
}

const balance = async (req, res) => {
  const { body } = req

  let balances = await wallet.getData({ coins: body.coins })
  res.json({ balances })
}

const withdraw = async (req, res) => {
  let from = req.params.from
  let to = req.query.to
  let value = req.query.value

  if (!(from in ['btc', 'eth'])) {
    return res.status(403).json({ error: 'no such currency'})
  }

  console.log(new Date().toISOString(), 'from', from)
  console.log(new Date().toISOString(), 'to', to)
  console.log(new Date().toISOString(), 'value', value)

  try {
    await wallet.withdraw(from, to, value)
    res.json({ from, to, value })
  } catch (err) {
    res.status(500).json({ error: err, description: err.description })
    throw err
  }
}


export { balance, getMe, getWallet, getWalletDetailed, withdraw }
