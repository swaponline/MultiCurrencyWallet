export const reduceMessages = result =>
  result.reduce(
    (acc, msg) => ({ ...acc, [msg.id]: msg.message || msg.defaultMessage }),
    {}
  )


export const defaultLocale = () => 'en'
export const localisePrefix = '/:locale(en|ru)?'
const getFixedLocale = locale => locale === 'en' ? '' : locale
const prepareUrl = (locale, link = '') => `${getFixedLocale(locale)}${link}`.replace(/^\/|\/$/g, '')
export const localisedUrl = (locale, link = '') => `/${prepareUrl(locale, link)}`
export const relocalisedUrl = (locale, link = '') => localisedUrl(locale.toLowerCase() === 'en' ? 'ru' : 'en', link)
