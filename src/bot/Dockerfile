FROM       node:12.20.0-alpine3.9

#docker build --tag labot .
#docker run --restart unless-stopped --name labot --hostname labot -d -p 30937:3002 -p 30901:3001 -p 30922:22 labot:latest

RUN apt-get update

RUN apt-get install -y curl npm git build-essential g++ python make mc screen

RUN cd root && git clone https://github.com/swaponline/MultiCurrencyWallet && cd MultiCurrencyWallet && npm i

RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

EXPOSE 1337 3001 3002 22

CMD    ["npm", "run", "bot"]
