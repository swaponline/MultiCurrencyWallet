FROM       ubuntu:18.04

#docker run --restart unless-stopped --name labot --hostname labot -d -p 30937:1337 -p 30901:3001 -p 30922:22 labot:latest

RUN apt-get update

RUN apt-get install -y openssh-server curl npm git build-essential g++ python make mc screen

RUN mkdir /var/run/sshd
RUN mkdir /root/.ssh


RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash \
&& export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" \

ENV NODE_VERSION v11.15.0

RUN echo "#!/bin/bash" > /root/install_node.sh
RUN echo "/root/.nvm/nvm install v11.15.0" >> /root/install_node.sh
RUN echo "/root/.nvm/nvm alias default v11.15.0" >> /root/install_node.sh
RUN echo "/root/.nvm/nvm use default" >> /root/install_node.sh
RUN echo "/root/.nvm/nvm list" >> /root/install_node.sh
RUN chmod +x /root/install_node.sh

RUN cd root && git clone https://github.com/swaponline/MultiCurrencyWallet && cd MultiCurrencyWallet

WORKDIR /root/MultiCurrencyWallet

RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

EXPOSE 1337 3001 3002 22

CMD    ["/usr/sbin/sshd", "-D"]
CMD    ["npm", "run", "bot"]
CMD    ["node", "src/bot/monitor.js"]
