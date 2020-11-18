import { localStorage, constants } from 'helpers'


const name = 'Initial migration'
const run = () => {
  localStorage.setItem(constants.localStorage.hiddenCoinsList, [])
  return Promise.resolve()
}

export default {
  name,
  run,
}
