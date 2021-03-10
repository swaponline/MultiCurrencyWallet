import ws from 'ws'


try {
  const server = new ws('ws://localhost:7333')
  server.on('message', mess => console.dir(JSON.parse(mess)))
} catch (err) {
  console.error(err)
}
