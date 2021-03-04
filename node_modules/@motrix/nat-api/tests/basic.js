const NatAPI = require('../')

var client = new NatAPI()

const port = 6690

client.map({ publicPort: port, privatePort: port, protocol: 'UDP' }, function (err) {
  if (err) return console.log(err)
  console.log('Port ' + port + ' mapped to ' + port + ' (TCP)')

  client.destroy(function () {
    console.log('NatAPI client destroyed')
  })
})
