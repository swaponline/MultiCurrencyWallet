FROM node

COPY ./express.js /src/express.js
COPY ./package.json /src/package.json

RUN cd /src; npm install --production

EXPOSE 8000

CMD ["node", "/src/express.js"]
