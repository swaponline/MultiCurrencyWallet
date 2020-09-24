# NEXT.coin node - HOWTO


## Terms

- `nextd` - NEXT.coin node daemon (3rd side)
- `nextp` - http RPC proxy


## Dependencies

- `pm2`


## Install

### Install `nextd`

<!-- can't sync precompiled nextd binaries, use manual install -->

<!-- 
```sh
sudo sh nextd-install.sh
```
or install it manually (download `nextd` from https://chain.next.exchange/#downloads)

or -->build it from sources (by request)

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
