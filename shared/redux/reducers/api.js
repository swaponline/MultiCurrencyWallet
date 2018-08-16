import config from 'app-config'


export const initialState = {
  servers: config.api,
  checked: false,
  errors: null,
}

export const setChecked = (state, checked) => ({
  ...state,
  checked,
})

export const setErrors = (state, errors) => ({
  ...state,
  errors,
  checked: true,
})

export const setApiServer = (state, { provider, server }) => ({
  ...state,
  servers: {
    ...state.servers,
    [provider]: server,
  },
})
