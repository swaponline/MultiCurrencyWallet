let URL = require('url-parse');
import { request } from 'helpers'
import config from 'app-config'

const newReferral = (eth_address) => {

  let {query} = new URL(window.location.href, 1);
  if(query.ref) {
    request.get(`${config.referral.url}?referral=${query.ref}&action=add_referrer&address=${eth_address}`)
  }
}

export default {
  newReferral
}
