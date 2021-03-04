const express = require('express')
const menoetius = require('menoetius')

const app = express()
menoetius.instrument(app)

app.get('/', function (req, res) {
  var high = 500, low = 150

  setTimeout(() => {
    res.send()
  }, Math.floor(Math.random() * (high - low) + low))
})

app.listen(8000, () => {
  console.log('express listening on 8000')
})
