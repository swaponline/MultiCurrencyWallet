import axios from 'axios'


const isFeedbackEnabled = true


const sendMessage = ({ appPart, eventName, details }) => {
  if (!isFeedbackEnabled) {
    return
  }

  const host = window.top.location.host || window.location.hostname || document.location.host

  const textToSend = `[${host}] ${appPart} - ${eventName}${details ? ` {${details}}` : ``} |`

  if (host && host.includes('localhost')) {
    console.log(`📩 (mocked) ${textToSend}`)
    return
  }

  console.log(`📩 ${textToSend}`)

  try {
    axios({
      url: `https://noxon.wpmix.net/counter.php?msg=${encodeURI(textToSend)}&todevs=1`,
      method: 'post',
    }).catch(e => console.error(e))
  } catch (error) {
    console.error(error)
  }
}

const events = {
  app: {
    started: 'started',
    otherTabsClosed: 'otherTabsClosed',
    closed: 'closed',
  },
  createWallet: {
    started: 'started',
    finished: 'finished',
  },
  wallet: {
    faqOpened: 'faqOpened',
    bannerClicked: 'bannerClicked',
  },
  backup: {
    started: 'started',
    finished: 'finished',
  },
  withdraw: {
    started: 'started',
    finished: 'finished',
  },
  exchangeForm: {
    flipped: 'flipped',
    selectedCurrencyFrom: 'selectedCurrencyFrom',
    selectedAddressFrom: 'selectedAddressFrom',
    selectedCurrencyTo: 'selectedCurrencyTo',
    selectedAddressTo: 'selectedAddressTo',
    swapRequestSended: 'swapRequestSended',
  },
  createOffer: {
    started: 'started',
    finished: 'finished',
  },
  offers: {
    deleted: 'deleted',
    shared: 'shared',
    buyPressed: 'buyPressed',
    swapRequestSended: 'swapRequestSended',
  },
  tooltip: {
    showed: 'showed',
  },
  i18n: {
    switched: 'switched',
  },
}

const feedback = {}

Object.keys(events).forEach(appPart => {
  if (!feedback[appPart]) {
    feedback[appPart] = {}
  }
  const appPartEvents = events[appPart]
  Object.keys(appPartEvents).forEach(eventName => {
    feedback[appPart][eventName] = function (details) {
      sendMessage({ appPart, eventName, details })
    }
  })
})

export default feedback

/*

feedback.app.start()
feedback.offersList.delete()
feedback.offerlist.buyStart()
feedback.exchangeForm.flip()
feedback.faq.open()

*/
