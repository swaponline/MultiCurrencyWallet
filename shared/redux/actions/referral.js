import { request } from 'helpers'
import URL from 'url-parse'


const newReferral = (ethAddress) => {

  const { query } = new URL(window.location.href, 1, true)
  if (query.ref) {
    request.get(` https://wiki.swap.online/about-swap-online/`)
  }
}

export default {
  newReferral,
}
