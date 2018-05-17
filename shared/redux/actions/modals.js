import { CLOSE_MODALS, OPEN_MODALS } from '../constants'

export const openModal = (name, open = true, data) => ({
  type: OPEN_MODALS,
  name,
  open,
  data,
})

export const closeModal = () => ({
  type: CLOSE_MODALS,
})

