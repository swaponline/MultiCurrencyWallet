import { apiLooper } from 'helpers'
import reducers from 'redux/core/reducers'

const serviceIsAvailable = async (params) => {
  const { chainId } = params

  try {
    const res: any = await apiLooper.get('oneinch', `/${chainId}/healthcheck`)

    return res?.status === 'OK'
  } catch (error) {
    console.group('%c 1inch service', 'color: red')
    console.log(error)
    console.groupEnd()

    return false
  }
}

const fetchTokens = async (params) => {
  const { chainId } = params

  try {
    const data: any = await apiLooper.get('oneinch', `/${chainId}/tokens`)

    return data.tokens
  } catch (error) {
    console.group('%c 1inch tokens', 'color: red')
    console.log(error)
    console.groupEnd()

    return {}
  }
}

const addTokens = (params) => {
  const { chainId, tokens } = params

  reducers.currencies.add1inchTokens({
    chainId,
    tokens,
  })
}

const approveToken = async (params) => {
  const { chainId, amount, contract } = params

  const request = ''.concat(
    `/${chainId}/approve/calldata?`,
    `amount=${amount}&`,
    `tokenAddress=${contract}&`
  )

  try {
    const approveData = await apiLooper.get('oneinch', request)

    return approveData
  } catch (error) {
    console.group('%c 1inch token approve', 'color: red')
    console.log(error)
    console.groupEnd()

    return false
  }
}

export default {
  serviceIsAvailable,
  fetchTokens,
  addTokens,
  approveToken,
}
