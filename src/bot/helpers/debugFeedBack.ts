import request from 'request-promise-cache'

export const debugFeedBack = (message: string, toDev?: boolean): void => {
  const chatId: number = (process.env.TELEGRAM_CHATID)
    ? new Number(process.env.TELEGRAM_CHATID)
    : 0
  const infoURL: string = (chatId === 0)
    ? 'https://noxon.wpmix.net/counter.php?toshendel=1&msg=' + encodeURIComponent(message) + ((toDev) ? '&toDev=1' : '')
    : `https://noxon.wpmix.net/counter.php?toshendel=1&msg=${encodeURIComponent(message)}&toChat=${chatId}`

  request(infoURL).then( () => {})
}