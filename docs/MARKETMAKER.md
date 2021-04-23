# How to launch a marketmaker

## Launch using docker (RECOMMENDED)
1. install docker and docker-compose https://docs.docker.com/engine/install/ https://docs.docker.com/compose/install/
2. run bot script
```
bash <(wget -qO- https://raw.githubusercontent.com/swaponline/MultiCurrencyWallet/master/scripts/startBot.sh)
```

## Launch using Node.js
```
git clone https://github.com/swaponline/MultiCurrencyWallet.git
cd MultiCurrencyWallet
npm i 
npm run marketmaker:testnet SECRET_PHRASE="asd asd asd" SPREAD="5"

```
![](https://screenshots.wpmix.net/putty_3ISF58oZz8jfJwFuyyMFpfocPTBR7aC4.png)

1. then top up adressess to start trading
2. don't forget to topup Ethereum balance

![](https://screenshots.wpmix.net/chrome_VfMLfx2KBVUIxaGsQ6ECBEKUq2VMF7Ag.png)

## Config prices, pairs, etc
Edit files:
- `./tradeconfig.mainnet.json`
- `./tradeconfig.testnet.json`


## Enable telegram notifications
1. contact @get_id_bot to get your id
2. say "hello" to this bot https://t.me/swaponlinebot
3. set env variable
```
TELEGRAM_CHATID = 111111 //your id
```

## Update docker image and container to the latest version
```
cd mainnet_bot  //your working folder (created at installation)
```
Update container and restart service (don't worry the data isn't affected because it's stored in the folder as "volume" not in the container).
```
docker-compose pull mcw_bot && docker-compose stop && docker-compose up -d
```

## login and password
admin 
qwertyasd123

