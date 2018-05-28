export const initialState = {}

export const show = (state, { name, data = {} }) => ({
  ...state,
  [name]: {
    name,
    data,
  },
})

export const hide = (state, name) => {
  const { [name]: closingNotification, ...otherNotifications } = state
  return otherNotifications
}
