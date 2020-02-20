import helpers from "helpers";

const getInfo = (currency, txRaw) => {

  let prefix = currency.toLowerCase()

  if(['btc (multisig)', 'btc (sms-protected)'].includes(prefix)) {
    prefix = 'btc'
  }

  const tx = helpers[prefix].getTx(txRaw);
  const link =  helpers[prefix].getLinkToInfo(tx);

  return {
    tx,
    link
  }
}
export default {
  getInfo
}