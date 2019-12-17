export const reduceMessages = result =>
  result.reduce(
    (acc, msg) => ({ ...acc, [msg.id]: msg.message || msg.defaultMessage }),
    {}
  )


export const defaultLocale = () => navigator.language.split('-')[0]

export const localisePrefix = '/:locale(en|ru)?'
const getFixedLocale = locale => locale === 'en' ? '' : locale
const prepareUrl = (locale, link = '') => `${getFixedLocale(locale)}${link}`.replace(/^\/|\/$/g, '')
export const localisedUrl = (locale, link = '') => `/${prepareUrl(locale, link)}/`
export const unlocalisedUrl = (locale, link = '') => locale === 'en' ? link : link.split('/ru')[1]
export const relocalisedUrl = (locale, link = '') => localisedUrl(locale.toLowerCase() === 'en' ? 'ru/' : 'en/', link)
