# Human Standard Token ABI

A simple node module that exports the [Ethereum ABI][1] for [ERC 20][2] compatible tokens.

Requires the web3 API to be available, either by initailizing it yourself, or using a web3-injecting Javascript environment, like Geth, MetaMask, or Mist.

## Usage

``` javascript
var abi = require('human-standard-token-abi')

var token = web3.eth.contract(abi).at(contractAddress)
var addr = web3.eth.accounts[0]

// Get the token name
token.name.call(function(err, name) {
  if(err) { console.log(err) }
  if(name) { console.log('The token name is: ' + name) }
})

// Get the token symbol
token.symbol.call({from: addr}, function(err, symbol) {
  //ABI expects string here,
  if(err) { console.log(err) }
  console.log('Token symbol: ' + symbol)
})

token.totalSupply.call({from: addr}, function(err, totalSupply) {
  console.log(totalSupply)
})

token.balanceOf.call(web3.eth.accounts[0], function (err, bal) {
  if (err) { console.error(err) }
  console.log('balance is ' + bal.toString(10))
})

var value = '100' // Base 10, accounts for decimals.
token.transfer(toAddress, value, { from: addr }, function (err, txHash) {
  if (err) console.error(err)

  if (txHash) {
    console.log('Transaction sent')
    console.dir(txHash)
  }
})

```

## Run the example

First install `http-server` (`npm install -g http-server`).

Then run it in this folder: `http-server`.

Then visit that port, probably something like: `http://localhost:8080/example`.

### Rebuild the example

If you edit `example/index.js`, you'll have to rebuild by running `npm run build`.

[1]: https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI
[2]: https://github.com/ethereum/EIPs/issues/20
