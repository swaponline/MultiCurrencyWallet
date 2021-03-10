import request from 'request-promise-cache'


export const debugFeedBack = (message: string, toDev?: boolean): void => {
  const chatId: number = (process.env.TELEGRAM_CHATID)
    ? Number(process.env.TELEGRAM_CHATID)
    : 0
  const infoURL: string = (chatId === 0 || toDev)
    ? 'https://noxon.wpmix.net/counter.php?msg=' + encodeURIComponent(message) + ((toDev) ? '&todevs=1' : '')
    : `https://noxon.wpmix.net/counter.php?msg=${encodeURIComponent(message)}&tochatid=${chatId}`


  request(infoURL).then(() => {}).catch((e) => { /* silent error if counter is down */ })
}

export const feedbackToOwner = (message: string): void => {
  if (process.env.TELEGRAM_CHATID !== undefined)
    debugFeedBack(message)
}
