FROM node

COPY ./restify.js /src/restify.js
COPY ./package.json /src/package.json

RUN cd /src; npm install --production

EXPOSE 8001

CMD ["node", "/src/restify.js"]
