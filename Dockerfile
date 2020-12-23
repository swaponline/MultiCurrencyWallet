FROM  node:12-slim

#docker run --rm -it $(docker build -q .) 
#docker build --tag labot .
#docker run --restart unless-stopped --name labot --hostname labot -d -p 30937:3002 -p 30901:3001 -p 30922:22 labot:latest

RUN apt-get update && apt-get install -yq curl git  g++ python make mc screen

# ADD https://api.github.com/repos/swaponline/MultiCurrencyWallet/git/refs/heads/master version.json
RUN git clone -b master https://github.com/swaponline/MultiCurrencyWallet.git /root/MultiCurrencyWallet

WORKDIR /root/MultiCurrencyWallet

RUN npm i

EXPOSE 80


