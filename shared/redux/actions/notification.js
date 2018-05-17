import { UPDATE_NOTIFICATION } from '../constants'

export const updateNotification = (name, open = false, data) => ({
  type: UPDATE_NOTIFICATION,
  name,
  open,
  data,
})
