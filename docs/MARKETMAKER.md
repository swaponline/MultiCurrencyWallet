# How to launch a marketmaker

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

## Launch using docker
```
docker pull swaponline/mcw
docker run -P -d --restart always --env "SECRET_PHRASE=bla bla bla 12 words seed phrase" swaponline/mcw:latest
```
or 
```
docker pull swaponline/mcw
docker-compose up -d 
```

## update prices, pairs, etc 
see ./tradeconfig.mainnet.json
./tradeconfig.testnet.json


## ENV variables
```
TELEGRAM_CHATID = 111 //id for notifications. 1. contact @get_id_bot to get your id 2. say "hello" to this bot @swaponlinebot 
```
