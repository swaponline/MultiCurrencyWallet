const swap = require('../src/index')

const {
  on: { onFinish },
  room: { ready },
  orders: { request, subscribe },
  swap: { onStep, start },
  history: { save, get, remove },
} = swap.helpers

const { app, wallet, auth, room, orders } = swap.setup({
  swapRoom: {
    roomName: 'xxx.swap.online'
  }
})

beforeAll(done => {
  ready(room).then(done)
})

test('check app loaded', () => {
  expect(app.isTestNet()).toBe(true)
  expect(app.isMainNet()).toBe(false)
})

test('sets the right type of room', () => {
  expect(app.services.room.roomName).toBe('xxx.swap.online')
})
