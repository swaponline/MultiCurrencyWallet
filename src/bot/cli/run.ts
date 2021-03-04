import readline from './helpers/readline'
import { HELP, FULL_HELP } from './helpers/help'
import { methods_list, decodeMethod, printHelp } from './helpers/methods'
import RESTInterface from './interface'


const HOST = process.env.HOST || `localhost`
const url = process.argv[2] || `http://${HOST}:1337`
const bot = new RESTInterface(url)

console.clear()
console.log(`Using url = ${bot.url}`)

const totals_info = (json) => {
  if (Array.isArray(json))          return `Total: ${json.length}`
  else if (typeof json == 'string') return `String length: ${json.length}`
  else if (json)                    return `Keys: ${Object.keys(json)}`
  else return ``
}

const printPromise = (promise) => {
  if (!promise || !promise.then) return promise

  return promise
    .then(json => {
      console.log('Response:')
      if (typeof json == 'string')
        console.log(json)
      else
        console.dir(json)

      console.log(totals_info(json))

      return json
    })
    .catch(({ name, message, ...etc }) => console.error({ name, message }))
}

const selectMethod = (input) => {
  const tokens = input.split(' ').filter(e => !!e)
  const [action, ...payload] = tokens

  if (payload == 'help') {
    return () => console.log(printHelp(action))
  } else if (methods_list.includes(action) || payload.length) {
    const vars = decodeMethod(action, payload)

    return () => bot.callMethod(action, vars)
  } else {
    switch (action) {
      case 'clear':   return () => console.clear()
      case 'me':      return () => bot.getMe()
      case 'balance': return () => bot.runMethod('me/balance')
      case 'o':       return () => bot.getOrders()
      case 'orders':  return () => bot.getOrders()
      case 'help':    return () => console.log(HELP)
      case 'spec':    return () => console.log(FULL_HELP)

      default:        return () => bot.runMethod(input)
    }
  }
}

const runInput = async (input) => {
  try {
    const method = selectMethod(input)
    const reply = method()

    await printPromise(reply)
  } catch (err) {
    console.error(err)
  }

  cycle()
}

const cycle = async (input?) => {
  if (input) {
    await runInput(input)
  } else {
    const command = await readline()
    await runInput(command)
  }
}

cycle('me')
