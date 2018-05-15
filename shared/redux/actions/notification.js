import { UPDATE_NOTIFICATION } from '../constants'

export const updateNotification = (name, open = true, data = {}) => ({
    type: UPDATE_NOTIFICATION,
    name,
    open,
    data
})
