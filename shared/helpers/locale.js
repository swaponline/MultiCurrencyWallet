export const reduceMessages = result =>
  result.reduce(
    (acc, msg) => ({ ...acc, [msg.id]: msg.message || msg.defaultMessage }),
    {}
  )


export const defaultLocale = () => 'en'

export const localisePrefix = '/:locale(en|ru)?'
export const localisedUrl = () => ``
