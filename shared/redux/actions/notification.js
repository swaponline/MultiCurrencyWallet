export const UPDATE_NOTIFICATION = 'UPDATE_NOTIFICATION'

export const updateNotification = (name, open = true, data = {}) => ({
    type: UPDATE_NOTIFICATION,
    name,
    open,
    data
})
