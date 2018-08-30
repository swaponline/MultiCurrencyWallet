import { request } from 'helpers'
import config from 'app-config'


const URL = require('url-parse')


const newReferral = (ethAddress) => {

  const { query } = new URL(window.location.href, 1, true)
  if (query.ref) {
    request.get(`${config.referral.url}?referral=${query.ref}&action=add_referrer&address=${ethAddress}`)
  }
}

export default {
  newReferral,
}
