import axios from 'axios'
import { routing, links, externalConfig } from 'helpers'

const isFeedbackEnabled = !externalConfig.isWidget || window?.STATISTICS_ENABLED
const marks = {
  danger: '🔴',
  warning: '🔥',
  attention: '💥',
  unimportant: '💤',
}

const sendMessage = ({ appPart, eventName, details }) => {
  if (!isFeedbackEnabled) {
    return
  }

  let host = routing.getTopLocation().host || window.location.hostname || document.location.host
  let version = window.pluginVersion
  let remainingLicenseDays = window.licenceInfo
  let prefixMark = ''
  const regexp = new RegExp(host)

  if (links.extension.match(regexp)) {
    host = 'Chrome extension'
  }

  if (eventName === 'failed') prefixMark = marks.danger
  if (eventName === 'warning') prefixMark = marks.warning

  const textToSend = [
    `${prefixMark ? `${prefixMark} ` : ''}`,
    `[${host}${remainingLicenseDays ? ` license days left: ${remainingLicenseDays}` : ''}] `,
    `${version ? `(version: ${version})` : ''}`,
    `${appPart} - ${eventName}`,
    `${details ? ` {${details}}` : ``} |`,
  ].join('')

  if (host && host.includes('localhost')) {
    console.log(`📩 (muted) ${textToSend}`)
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
    //closed: 'closed',
    failed: 'failed',
    warning: 'warning',
  },
  createWallet: {
    //started: 'started',
    currencySelected: 'currencySelected',
    securitySelected: 'securitySelected',
    finished: 'finished',
  },
  wallet: {
    clickedBanner: 'clickedBanner',
    pressedAddCurrency: 'pressedAddCurrency',
  },
  createInvoice: {
    failed: 'failed',
  },
  faq: {
    opened: 'opened',
    failed: 'failed',
  },
  backup: {
    started: 'started',
    finished: 'finished',
  },
  restore: {
    started: 'started',
    finished: 'finished',
  },
  withdraw: {
    entered: 'entered',
    started: 'started',
    finished: 'finished',
    failed: 'failed',
  },
  exchangeForm: {
    flipped: 'flipped',
    selectedAddress: 'selectedAddress',
    redirectedCreateWallet: 'redirectedCreateWallet',
    requestedSwap: 'requestedSwap',
    failed: 'failed',
  },
  createOffer: {
    started: 'started',
    finished: 'finished',
  },
  offers: {
    //shared: 'shared',
    deleted: 'deleted',
    buyPressed: 'buyPressed',
    swapRequested: 'swapRequested',
  },
  swap: {
    started: 'started',
    stopped: 'stopped',
    finished: 'finished',
  },
  oneinch: {
    createOrder: 'create the order',
    cancelOrder: 'cancel the order',
    failed: 'failed',
  },
  liquiditySource: {
    startedSwap: 'start the swap',
    addLiquidity: 'add liquidity',
    removeLiquidity: 'remove liquidity',
    failed: 'failed',
  },
  zerox: {
    startedSwap: 'start the swap',
    failed: 'failed',
  },
  marketmaking: {
    enteredPromo: 'enteredPromo',
    selected: 'selected',
    enteredSettings: 'enteredSettings',
    faqOpened: 'faqOpened',
    prevented: 'prevented',
    enabled: 'enabled',
    disabled: 'disabled',
  },
  theme: {
    switched: 'switched',
  },
  i18n: {
    switched: 'switched',
  },
  actions: {
    failed: 'failed'
  },
  helpers: {
    failed: 'failed'
  },
}

interface IFeedback {
  [key: string]: {
    [key: string]: (object?) => void
  }
}

const feedback: IFeedback = {}

Object.keys(events).forEach(appPart => {
  if (!feedback[appPart]) {
    feedback[appPart] = {}
  }
  const appPartEvents = events[appPart]
  Object.keys(appPartEvents).forEach(eventName => {
    feedback[appPart][eventName] = function(details) {
      sendMessage({ appPart, eventName, details })
    }
  })
})

export default feedback
