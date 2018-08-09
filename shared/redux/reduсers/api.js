import config from 'app-config'

export const initialState = {
  servers: config.api
}

export const setApiServer = (state, {provider, server}) => ({
  ...state,
  servers: { ...state.servers, [provider]: server },
  updatedServers: { ...state.updatedServers, [provider]: server}
})
