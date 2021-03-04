const http = require('http')
const menoetius = require('menoetius')

const server = http.createServer((req, res) => {
  if (req.url !== '/metrics') {
    res.statusCode = 200
    res.end()
  }
})

menoetius.instrument(server)

server.listen(8003, () => {
  console.log('http listening on 8003')
})
