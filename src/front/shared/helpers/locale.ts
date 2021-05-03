export const reduceMessages = result =>
  result.reduce(
    (acc, msg) => ({ ...acc, [msg.id]: msg.message || msg.defaultMessage }),
    {}
  )

export const defaultLocale = () => navigator.language.split('-')[0]

const prepareUrl = (link = '') => link.replace(/^\/|\/$/g, '')

export const localisedUrl = (locale, link = '') => `/${prepareUrl(link)}`