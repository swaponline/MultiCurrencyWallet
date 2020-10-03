import request from 'request-promise-cache'

export const debugFeedBack = (message, toDev) => {
  const infoURL = 'https://noxon.wpmix.net/counter.php?toshendel=1&msg=' + encodeURIComponent(message) + ((toDev) ? '&toDev=1' : '')

  request(infoURL).then( () => {})
}