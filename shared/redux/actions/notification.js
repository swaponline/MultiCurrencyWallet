import reducers from '../core/Reducers'

export const updateNotification = (name, open = false, data) => {
  reducers.loader.updateNotification(name, open, data)
}
