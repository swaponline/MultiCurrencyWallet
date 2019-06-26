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

const getTracker = () => {
  if (window.ga) {
    try {
      return window.ga.getAll()[0]
    } catch (error) {
      console.log(error)
      return undefined
    }
  } else {
    return undefined
  }
}

const errorEvent = (eventAction) => {
  if (getTracker()) {
    const tracker = getTracker()
    tracker.send({ hitType: 'event', eventCategory: 'fatalError', eventAction })
  }
}

const swapEvent = (eventAction, eventLabel) => {
  if (getTracker()) {
    const tracker = getTracker()
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

export default {
  getTracker,
  dataEvent,
  swapEvent,
  balanceEvent,
}
