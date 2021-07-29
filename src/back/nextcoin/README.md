# NEXT.coin node

## Terms

- `nextd` - NEXT.coin node daemon (3rd side)
- `nextp` - http RPC proxy

## Connection scheme

```
                        -----[server]------  
nextcoin_blockchain <-> | nextd <-> nextp | (public API) <-> front
                        -------------------
```
## API endpoints
|  | API url |
|---|---|
| network status | https://next.swaponline.io/mainnet |
| balance | https://next.swaponline.io/mainnet/addr/XQmHsxbzoxVd2Jux373iWMsPV26YVTMocz |
| transactions | https://next.swaponline.io/mainnet/txs/XQmHsxbzoxVd2Jux373iWMsPV26YVTMocz |
| UTXOs | https://next.swaponline.io/mainnet/addr/XQmHsxbzoxVd2Jux373iWMsPV26YVTMocz/utxo |


## Dependencies

- `node`
- `pm2`

## Installation

### Install `nextd`

<!-- can't sync precompiled nextd binaries, use manual install -->

```sh
sudo sh nextd-install.sh
```
or download from https://github.com/NextExchange/next-wallet-desktop-app/releases/

### Install `nextp` dependencies

`npm i`


## Start

- `sh nextd-start.sh` - start nextd
- `sh nextp-start.sh` - start nextp


## Logs

- `sh nextd-logs.sh` - nextd logs
- `sh nextp-logs.sh` - nextp logs


## Stop

- `sh nextd-stop.sh` - stop nextd
- `sh nextp-stop.sh` - stop nextp


## Develop & debug

`sh request-example.sh` - request example

See available request methods in `next-rpc-methods.txt`

See also `next-options.txt`
