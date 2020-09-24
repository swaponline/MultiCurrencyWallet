# simple swap core

Simplest usage:

```javascript
//const swap = require('simple.swap.core')
const swap = require('./../src/index')

const {
  on: { onFinish },
  room: { ready },
  orders: { request, subscribe },
  swap: { onStep, start },
} = swap.helpers

const { wallet, auth, room, orders } = swap.setup

const doSwap = async order => {
  console.log('new order', order.id)
  if (order.buyAmount > 10) {
    const swap = await request(order)

    console.log('starting swap', swap.flow._flowName, swap.id)

    start(swap)

    await onFinish(swap)

    console.log('finished swap', swap.id)
  }
}

(async () => {
  const info = await wallet.getBalance()
  console.log('balance:', info)

  await ready(room)
  console.log('info:', wallet.view())

  orders.on('new orders', orders => orders.map(doSwap))
  orders.on('new order', doSwap)
})()

```

## Examples

Go to `src/` directory, then:

```bash
npm i
```

Go to `examples/` directory, then:

```bash
npm i
cp .env.example .env
npm start
```

In the `.env`:

- `ROOT_DIR` is where the credentials are stored. If omitted, `.` will be used
- `ACCOUNT` or `SERVER_ID` is the name of the account directory inside `$ROOT_DIR`:

    `$ROOT_DIR/.storage/$ACCOUNT`
    `$ROOT_DIR/.ipfs/$ACCOUNT`

  Will be generated if not given.

- `NETWORK` is one of the `mainnet`, `testnet`. Default = `testnet`
- `OFFSET` is better to be omitted!

 _this variable should be consistent between different scripts if you wish to access the same IPFS peer id. By default `OFFSET` is a `process.argv[1]`, which is usually the name of the script you run: `node bot.js` => `bot.js`, so if you launching the same file, it will match._
