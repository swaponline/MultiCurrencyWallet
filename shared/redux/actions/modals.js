import reducers from 'redux/core/reducers'


export const open = (name, open, data) => {
  reducers.modals.open({ name, open, data })
}

export const close = () => {
  reducers.modals.close()
}

