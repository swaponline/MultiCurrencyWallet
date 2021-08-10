import { localStorage, constants } from 'helpers'

const name = 'Update exchange localStorage settings - remove extra string layer'

const run = () => {
  let exchangeSettings = localStorage.getItem(constants.localStorage.exchangeSettings)

  if (typeof exchangeSettings === 'string') {
    exchangeSettings = JSON.parse(exchangeSettings)

    localStorage.setItem(constants.localStorage.exchangeSettings, exchangeSettings)
  }

  return Promise.resolve()
}

export default {
  name,
  run,
}
