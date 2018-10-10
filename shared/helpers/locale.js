export const reduceMessages = result =>
  result.reduce(
    (acc, msg) => ({ ...acc, [msg.id]: msg.message || msg.defaultMessage }),
    {}
  )

export const currentLocale = () => 'en'

export const defaultLocale = () => 'en'