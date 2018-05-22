import reducers from 'redux/core/reducers'


export const open = (name, data) => reducers.modals.open({ name, data })

export const close = (name) => reducers.modals.close(name)
