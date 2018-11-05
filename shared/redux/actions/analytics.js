import TagManager from 'react-gtm-module'


const dataEvent = (eventName) => {
  window.dataLayer = window.dataLayer ? window.dataLayer : []
  window.dataLayer.push({ 'event' : eventName })
}

const balanceEvent = (currency, balance) => {
  window.dataLayer = window.dataLayer ? window.dataLayer : []
  window.dataLayer.push({
    'event': 'autoEvent',
    'eventCategory' : 'Balances',
    'eventAction' : 'Top-up-balance',
    'eventLabel' : currency,
    'eventValue' : balance,
  })
}

const swapEvent = (eventAction, eventLabel) => {
  if (window.ga) {
    const tracker = window.ga.getAll()[0]
    tracker.send({ hitType: 'event', eventCategory: 'Swap', eventAction, eventLabel })
  }

  if (window.yaCounter48876458) {
    window.yaCounter48876458.reachGoal(`swap-${eventAction}`, { currency: eventLabel })
  }
}

const tagManagerArgs = {
  gtmId: 'GTM-WK72GSV',
  dataLayerName: 'dataLayer',
}

if (!process.env.EXTENSION) {
  TagManager.initialize(tagManagerArgs)
}

export default {
  dataEvent,
  swapEvent,
  balanceEvent,
}
