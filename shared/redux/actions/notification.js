import reducers from '../core/reducers'

export const update = (name, open, data) =>
  reducers.notification.update({ name, open, data })

