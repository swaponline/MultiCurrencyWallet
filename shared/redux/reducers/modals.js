// this is necessary to arrange the modals in the opening order, not alphabetical
let zIndex = 305

export const initialState = {}

export const open = (state, { name, data = {} }) => ({
  ...state,
  [name]: {
    name,
    data,
    zIndex: ++zIndex,
  },
})

export const closeAll = (state) => ({})

export const close = (state, name) => {
  const { [name]: closingModal, ...otherModals } = state

  // zIndex -= 1

  return otherModals
}
