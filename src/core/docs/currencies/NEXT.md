# NEXT (NEXT.coin)

- node/wallet: https://chain.next.exchange/#downloads
- node/wallet src: (on request)
- github: https://github.com/NextExchange
- JS lib: https://github.com/NextExchange/nextcoin-js
- explorer: https://explore.next.exchange/
- explorer API: https://explore.next.exchange/#/api
- rank: https://www.coingecko.com/en/coins/next-coin
- buy: https://next.exchange/


## Type

btc-like


## Address example

### Zero-balance

XZUsFMpkgPjjfT1c9CwKKyY4TzdQhiKNju
XVt8u3g9XSMjJ4xH3PiQgMf8EGPeKtDihH
XXVaCs1kMB4LWLgAzCm812fRxud7UkAWoK

### Non-zero balance

XMkvVVvuQJp4mp5hoVHUPumbnvh63xJsN4
XNnXeCcxvPTVFo3DvWERBd6pWZvCfMn9AV
XEQ79EVHWKk9RkhKEnsMQijHiCGmiW42hc
XYxgHbApp338Bi4RQiNJrj4hA7zZ61NU1U
XDbs2n272UcHbaYw5SJjGwCQRxTkcPE2JK
XKN37tQogGcy8EXnGcmPSe19ySdy2Bezxn
XHDXx6GiEL7CT8WHU2kFDBLLPygn8DBdRD


### Address posfixes (???)
XCekEafQLQnvKTXcAfW5uQnnUu9MJkCfqB:POW - nodes
XWL71yBXn9VtqnzBNFDHxoXzL8RfSdXwcy:MN - masternodes


## Public key example

03b0da749730dc9b4b1f4a14d6902877a92541f5368778853d9c4a0cb7802dcfb2


## Script support

yes


## BIP-0044 coin type

707

(https://github.com/satoshilabs/slips/blob/master/slip-0044.md)


## Chain params

see node src: `src/chainparams.cpp`


## Node binaries dist

-nextd
-next-cli
-next-qt


## Node info

mainnet: 7077
testnet: 17077

### Node JSON-RPC

mainnet: 7078
testnet: 17078

----

## `ghost-bitcore-lib` used methods

bitcore.PrivateKey
bitcore.util.buffer
bitcore.Networks.mainnet
bitcore.Networks.testnet
bitcore.Transaction.Sighash.sign()
bitcore.Transaction()...

## Explorer Usage

https://explore.next.exchange/api/sendrawtransaction
body: rawtx = ...

https://explore.next.exchange/api/address/XMkvVVvuQJp4mp5hoVHUPumbnvh63xJsN4
https://explore.next.exchange/api/tx/f8ec81f26c89cc63c072e47a94c2a1dd8ee97a01d5d909707868d3dbb4221bda

tx link: https://explore.next.exchange/#/tx/f8ec81f26c89cc63c072e47a94c2a1dd8ee97a01d5d909707868d3dbb4221bda