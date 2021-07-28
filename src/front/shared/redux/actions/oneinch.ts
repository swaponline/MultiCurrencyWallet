import reducers from 'redux/core/reducers'

const addTokens = (params) => {
  const { chainId, tokens } = params

  reducers.currencies.add1inchTokens({
    chainId,
    tokens,
  })
}

export default {
  addTokens,
}
