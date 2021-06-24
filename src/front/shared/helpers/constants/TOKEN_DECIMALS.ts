import TOKEN_STANDARDS from 'helpers/constants/TOKEN_STANDARDS'
import config from 'helpers/externalConfig'

const decimals = {
  btc: 8,
  bnb: 18,
  eth: 18,
  matic: 18,
  arbeth: 18,
  ghost: 8,
  next: 8,
}

Object.keys(TOKEN_STANDARDS).forEach((key) => {
  const standard = TOKEN_STANDARDS[key].standard

  Object.keys(config[standard]).forEach((tokenName) => {
    decimals[tokenName] = config[standard][tokenName].decimals
  })
})

export default {
  ...decimals,
}
