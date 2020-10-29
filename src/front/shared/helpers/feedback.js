import axios from 'axios'


const isFeedbackEnabled = true


export default (msg) => {
  if (!isFeedbackEnabled) {
    return
  }

  const host = window.top.location.host || window.location.hostname || document.location.host

  const textToSend = `[${host}] ${msg} |`

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
  createWallet: {},
}

/*

feedback.app.start()
feedback.offersList.delete()
feedback.offerlist.buyStart()
feedback.exchangeForm.flip()
feedback.faq.open()

*/
