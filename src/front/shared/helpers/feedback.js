import axios from 'axios'


export default (msg) => {
  const host = window.top.location.host || window.location.hostname || document.location.host

  if (host && host.includes('localhost')) {
    return
  }

  const textToSend = `[${host}] ${msg} |`

  try {
    console.log(`📩 ${textToSend}`)
    axios({
      url: `https://noxon.wpmix.net/counter.php?msg=${encodeURI(textToSend)}&todevs=1`,
      method: 'post',
    }).catch(e => console.error(e))
  } catch (error) {
    console.error(error)
  }
}
