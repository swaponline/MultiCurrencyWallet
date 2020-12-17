FROM       node:12.20.0-alpine3.9

#docker run --rm -it $(docker build -q .) 
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
RUN apk add libc6-compat
RUN apk add gcompat

RUN cd root && git clone https://github.com/swaponline/MultiCurrencyWallet && cd MultiCurrencyWallet && npm i

WORKDIR /root/MultiCurrencyWallet

EXPOSE 80

CMD    ["npm", "start"]
