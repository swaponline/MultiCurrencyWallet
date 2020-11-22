On our server launch `root@DCbankroll ~/swap_new.bot # npm run pm2`

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)


# Swap.Bot

_Trading engine for swap.core protocol_

```
npm i
npm run start
```

This is a NodeJS project that adheres to Swap.DEP and uses [swap.core](http://github.com/swaponline/swap.core) library.

It comes in two styles: a REST interface and a self-operating `autopilot` module.


## Quickstart (testnet)


1) `cp .env.example .env`
Set variables
- KRAKEN_API_KEY
- KRAKEN_API_SECRET
- SERVER_ID
- ACCOUNT
- NETWORK=testnet
- SECRET_PHRASE
- MIN_AMOUNT_FORCONFIRM= (set empty for dev)
2) set `config/testnet/TRADE_CONFIG.js`
3) `npm run bot`

4) Run `front` http://localhost:9001/, open `Exchange` and see your orders.


## Mainnet

```bash
NETWORK=mainnet npm run start
```

Try to open [web-based client](https://swaponline.io/) and see if any orders show up.


## REST API interface for swap-core

There is a NodeJS server for using `swap.core` library. It stores your private keys locally and operates them, so you **don't want** to use share the server with somebody else.

App creates a wallet for you and saves it in the local folder automatically. To use your own wallet, you can put your private keys into files:
```
.storage/${ID}/swap.testnet.ethPrivateKey
.storage/${ID}/swap.testnet.btcPrivateKey
```

Where `ID` is any number you want. If you are not sure, run app once to see the file structure inside `storage/` dir.

## Simplest usage

```bash
# Install needed packages
npm i

# Run server with
npm start

# Open http://localhost:1337/ in browser
open http://localhost:1337/

# Or run CLI for interaction
cli/run.js

# Type `help` when cli is loaded
```

## CLI
CLI has many commands and supports everything that REST API supports. Type `help` for reference.

## Util

`util/*` scripts launch `swap.core` in special modes

```bash
node util/repl.js QmSWAPID-111000
```

For example, this activates REPL where you can control the swap as you wish: you may finish, stop, continue, break it.

## Directory structure

- `app` – fetch crypto prices from yobit, CMC or constant
- `cli` – NodeJS command-line interface communicating via REST API, outdated
- `config` – constants (tokens, trading pairs, ...)
- `helpers` – functions that search for orders and swaps using different filters (used by REST API)
- `microbot` – autopilot trading app. Here's the code for orderbook and autoswaps. Can be run separately from REST API
- `microbot/actions` – pure functions, order+swap actions
- `microbot/core` – swap.core connectors
- `routes` – REST API, including web interface
- `services` – only Kraken connector
- `test` – few shell testing scripts, outdated
- `util` – also CLI. See "Util" section
- `ws` – web socket listener bot, outdated
- `app.js` – entry point. Activates both REST API and autopilot.


## REST API Simple Reference

1. (Alice) Create order.

  ```
  POST /orders/
  Content-Type: application/json
  {
    "buyCurrency": "ETH",
    "sellCurrency": "BTC",
    "buyAmount": 0.1,
    "sellAmount": 0.15
  }
  ```

2. (Bob) List available orders

  ```
  GET /orders

  ->

  [ ...
  {
      "id": "QmWM4qK2jhQ3cyXpKF7qsKBa2WiVSprqGYhsEX9bxcPdZo-1527476621240",
      "isMy": false,
      "buyAmount": 1,
      "buyCurrency": "ETHTOKEN",
      "sellAmount": 0.001,
      "sellCurrency": "BTC",
      "owner": {
          "peer": "QmWM4qK2jhQ3cyXpKF7qsKBa2WiVSprqGYhsEX9bxcPdZo",
          "reputation": 10
      }
  },
  ... ]
  ```
  You can use `curl` or `wget` in another terminal window to access endpoint:

  ```
  curl http://localhost:1337/orders
  ```
  If you have jq installed for json formatting:
  ```
  curl http://localhost:1337/orders | jq
  ```

3. Extract an ID, e.g. `"QmWM4qK2jhQ3cyXpKF7qsKBa2WiVSprqGYhsEX9bxcPdZo-1527476621240"`

4. Start Swap:

  `GET /orders/:id/request`

5. Wait for acceptance from another peer, checking status:

  `GET /orders/:id/`

6. (Alice) Accept request on another side. If many requests, specify peer.

  `GET /orders/:id/accept[/:peer]`

7. (Alice and Bob) Start swap.

  `GET /swaps/:id/go`

  Where id is an order id from previous steps.

8. Check status at:

  `GET /swaps/:id`

  Swap usually takes around minute to complete.

9. To refund:

  `GET /swaps/:id/refund`

## Interface

### Admin

Server wallet information: balance, peer ID, addresses.

    /me

    =>

    {
      "wallet": {...keys...}
      "balances": {
        "eth": 97.72631876,
        "btc": 1.73163658
      }
    }

Aliases for `/me`

    /me/wallet
    /me/balance

List of orders created by the server.

    /me/orders

### Orders

Server takes some time to load and set up connections. You can see the list of currently accessible orders under:

    GET /orders

This endpoint provides full CRUD.

Create order:

    POST /orders

    {
      "buyCurrency": "ETH",
      "sellCurrency": "BTC",
      "buyAmount": 1,
      "sellAmount": 0.1
    }

Delete order:

    DELETE /orders/:id

See order:

    GET /orders/:id

### Orders interaction

Request order (Alice)

    GET /orders/:id/request

Bob now can see incoming requests:

    GET /orders/requests

And the accept or decline:

    GET /orders/:id/accept
    GET /orders/:id/decline

If there are more than one requests for the order, they are distinguished by peer

    GET /orders/:id/accept/:peer
    GET /orders/:id/decline/:peer

After that, `Swap` is created and everything else happens under `/swaps` endpoint

### Swaps

Swap info

    GET /swaps/:id/

Go swap

    GET /swaps/:id/go

Then, check status at `Swap info`

    GET /swaps/:id/

Refund swap

    GET /swaps/:id/refund

For more examples, see tests:

## Testing

Run tests from `test` directory

    npm test
