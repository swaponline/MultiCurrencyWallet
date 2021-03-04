# Menoetius
[![CircleCI](https://circleci.com/gh/achingbrain/menoetius/tree/master.svg?style=svg)](https://circleci.com/gh/achingbrain/menoetius/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/achingbrain/menoetius/badge.svg)](https://coveralls.io/github/achingbrain/menoetius)
[![Dependencies Status](https://david-dm.org/achingbrain/menoetius/status.svg)](https://david-dm.org/achingbrain/menoetius)

[![NPM](https://nodei.co/npm/menoetius.png)](https://nodei.co/npm/menoetius/)

Middleware to automatically instrument node applications for consumption by a [Prometheus](https://prometheus.io/) server.

Prometheus is an open source monitoring solution that obtains metrics from servers by querying against the /metrics endpoint upon them.

Once instrumented, Menoetius automatically serves [response duration](#duration) metrics, plus nodejs [system metrics](#system) on the /metrics endpoint ready to be consumed by Prometheus.

Menoetius will instrument websites and webservices that use [http](#http), [express](#express), [hapi](#hapi) and [restify](#restify).

# Instrumentation
Menoetius automatically measures a number of metrics once instrumented.
The following metrics are instrumented via the /metrics endpoint:

## <a name="duration"></a> Duration Metrics
There are two metrics measuring request duration:

- **http\_request\_duration\_milliseconds (summary)**: a [summary](https://prometheus.io/docs/concepts/metric_types/#summary) metric measuring the duration in milliseconds of all requests. It can be used to [calculate average request durations](https://prometheus.io/docs/practices/histograms/#count-and-sum-of-observations).
- **http\_request\_buckets\_milliseconds (histogram)**: a [histogram](https://prometheus.io/docs/concepts/metric_types/#histogram) metric used to count duration in buckets of sizes 500ms and 2000ms. This can be used to [calculate apdex](https://prometheus.io/docs/practices/histograms/#apdex-score) using a response time threshold of 500ms.

In each case, the following [labels](https://prometheus.io/docs/practices/naming/#labels) are used:

- **status**: the http status code of the response, e.g. 200, 500
- **method**: the http method of the request, e.g. put, post.
- **path**: the path of the request. Note that /users/freddie is labelled /users/ so as not to flood prometheus with labels
- **cardinality**: the cardinality of the request, e.g. /users/freddie has cardinality 'one', /users/ has cardinality 'many'

## <a name="system"></a> System Metrics
These are metrics provided by [prom-client](https://github.com/siimon/prom-client#default-metrics) that instrument the nodejs heap/rss usage and cpu usage etc.

# Installation
```
> npm install --save menoetius
```

Menoetius has only one method, instrument, and it has the following signature:
## instrument(server, options)

The first argument represents the server of the middleware.

The second argument is optional, and allows some configuration of menoetius

- `url` - the url on which to serve metrics. Defaults to `/metrics`.

See the following examples of use with [http](#http), [express](#express), [hapi](#hapi) and [restify](#restify).

# <a name="http"></a> http
```
const http = require('http');
const menoetius = require('../../index');

const server = http.createServer((req, res) => {
  if(req.url !== '/metrics') {
    res.statusCode = 200;
    res.end();
  }
});

menoetius.instrument(server);

server.listen(8003, '127.0.0.1', () => {
  console.log('http listening on 8003');
});

```
# <a name="express"></a> Express
```
const express = require('express');
const menoetius = require('menoetius');

const app = express();
menoetius.instrument(app);

app.get('/', (req, res) => {
  res.send();
});

app.listen(3000, () => {
  console.log('express server listening on port 3000');
});

```
# <a name="hapi"></a> Hapi
```
const Hapi = require('hapi');
const menoetius = require('menoetius');

const server = Hapi.Server({
    port: 8002
})

async function init() {
  try {
    await epithemeus.instrument(server);

    server.route({
      method: 'GET',
      path: '/',
      handler: async (request, h) => {
        return h.response()
      }
    })

    await server.start()

    console.log(`Hapi ${server.version} server listening on port 8002`)

  } catch(err) {
    console.log('Error', err);
    process.exit(1);
  }

}

init();
```
# <a name="restify"></a> Restify
```
const restify = require('restify');
const menoetius = require('menoetius');

const server = restify.createServer();

menoetius.instrument(this.server);

server.get('/', (req, res, done) => {
  res.send();
  done();
});

server.listen(3000, () => {
  console.log('restify server listening on port 3000');
});

```

# Try It Out
The docker-compose.yml file in the examples directory will create a prometheus server and an example each of an [http](#http), [express](#express), [hapi](#hapi) and [restify](#restify) server.

Assuming you have installed [docker](https://docs.docker.com) and [docker-compose](https://docs.docker.com/compose/install/), you can try it out by doing the following:

```
> cd examples
> docker-compose up
```

You can then view the prometheus server on [http://127.0.0.1:9090](http://127.0.0.1:9090)

# Etymology

![Menoetius](https://www.greekmythology.com/images/mythology/menoetius_152.jpg)

> Menoetius was a Titan god, son of Titans Iapetus and Clymene, and brother of Atlas, Prometheus and Epimetheus. His name derives from the Ancient Greek words "menos" (might) and "oitos" (doom), meaning "doomed might".
>
> [https://www.greekmythology.com/Titans/Menoetius/menoetius.html](https://www.greekmythology.com/Titans/Menoetius/menoetius.html)

Doom also stalks this module as hopefully one day [https://github.com/roylines/node-epimetheus/pull/63](https://github.com/roylines/node-epimetheus/pull/63) will be merged, obviating the need for this module to exist.
