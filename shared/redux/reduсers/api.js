import config from 'app-config'

export const initialState = {
  apiServers: config.api
}

export const setApiServer = (state, payload) => ({
  ...state,
  apiServers: { ...payload }
})
