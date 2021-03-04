FROM node

COPY ./http.js /src/http.js
COPY ./package.json /src/package.json

RUN cd /src; npm install --production

EXPOSE 8003

CMD ["node", "/src/http.js"]
