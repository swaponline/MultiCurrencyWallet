import { localStorage, constants } from 'helpers'

const name = 'Update exchange localStorage settings - convert settings from string into object'

const run = () => {
/*   let exchangeSettings = localStorage.getItem(constants.localStorage.exchangeSettings)

  if (typeof exchangeSettings === 'string') {
    exchangeSettings = JSON.parse(exchangeSettings)
  }

  localStorage.setItem(constants.localStorage.exchangeSettings, exchangeSettings) */

  return Promise.resolve()
}

export default {
  name,
  run,
}
