FROM node:14-alpine3.10

#docker build --tag labot .
#docker run --restart unless-stopped --name labot --hostname labot -d -p 30937:3002 -p 30901:3001 -p 30922:22 labot:latest

RUN apk update

RUN apk add curl
RUN apk add npm
RUN apk add git
RUN apk add --update build-base
RUN apk add g++
RUN apk add python
RUN apk add make
RUN apk add mc
RUN apk add screen

RUN cd root && git clone https://github.com/swaponline/MultiCurrencyWallet && cd MultiCurrencyWallet && npm i

EXPOSE 1337 3001 3002 22

CMD ["npm", "run", "marketmaker"]
