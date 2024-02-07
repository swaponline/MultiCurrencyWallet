import TOKEN_STANDARDS, { EXISTING_STANDARDS } from 'helpers/constants/TOKEN_STANDARDS'
import config from 'helpers/externalConfig'

const decimals = {
  btc: 8,
  bnb: 18,
  eth: 18,
  matic: 18,
  arbeth: 18,
  aureth: 18,
  xdai: 18,
  ftm: 18,
  avax: 18,
  movr: 18,
  one: 18,
  ame: 18,
  phi_v1: 18,
  phi: 18,
  fkw: 18,
  phpx: 18,
  ghost: 8,
  next: 8,
}

EXISTING_STANDARDS.forEach((standard) => {
  Object.keys(config[standard]).forEach((tokenName) => {
    decimals[tokenName] = config[standard][tokenName].decimals
  })
})

export default {
  ...decimals,
}
