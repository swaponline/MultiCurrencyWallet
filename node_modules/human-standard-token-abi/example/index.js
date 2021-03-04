var abi = require('../')
var contractAddress = '0xD8912C10681D8B21Fd3742244f44658dBA12264E' // Pluton mainnet address
contractAddress = '0xf5371b249e54362df1a2ee37def5cb848b5b9f41' // Danbucks on Ropsten

// rando testrpc token:
contractAddress = '0x48ff0cbac0acefedf152281ee80e9a0a01d5da63'

var secondAddress = '0xC5b8dBAc4c1d3F152cDeb400E2313F309c410aCb'


window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    web3 = new Web3(web3.currentProvider);
  } else {
    console.log('No web3? You should consider trying MetaMask!')
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  // Now you can start your app & access web3 freely:
  startApp()
})

var addr
function startApp(){
  var token = web3.eth.contract(abi).at(contractAddress)
  addr = web3.eth.accounts[0]

  window.token = token // try it out in your console!

  getBalance(addr)

  token.name.call(function(err, name) {
    if (err) return console.error('Problem getting name', err)
    console.log('Coin is named ' + name)
  })

  // Now to write a tx to the blockchain:
  token.transfer(secondAddress, '10', { from: addr }, function (err, hash) {
    if (err) return console.error('Problem sending tokens', err)
    console.log('tokens transferred in tx with hash', hash)

    // Now we poll for tx inclusion:
    var interval = setInterval(function() {
      web3.eth.getTransactionReceipt(hash, function (err, receipt) {
        if (err) return console.error('error getting receipt', err)
        console.log('tx receipt is:')
        console.dir(receipt)

        getBalance(addr)
        getBalance(secondAddress)
        clearInterval(interval)
      })
    }, 1000)

  })
}

function getBalance(addr) {
  console.log('getting balance for ' + addr)
  token.balanceOf.call(addr, function (err, bal) {
    if (err) { console.error(err) }
    console.log('token balance for account ' + addr + ' is ' + bal.toString(10))
  })
}
