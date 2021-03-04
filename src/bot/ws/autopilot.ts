import SocketBot from './socket-bot'
import REST from '../cli/interface'


const HOST = process.env.HOST || 'localhost'
const URL = process.env.API_HOST || `http://${HOST}:1337`
const SOCK = process.env.SOCK_HOST || `ws://${HOST}:7333`

const rest = new REST(URL)

const bot = new SocketBot(rest, SOCK, {
  accept: true,
  search: true,
})

bot.mainCycle()
