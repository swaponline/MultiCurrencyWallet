import reducers from '../core/Reducers'

export const openModal = (name, open = true, data) => {
  reducers.modals.openModal(name, open, data)
}

export const closeModal = () => {
  reducers.modals.closeModal()
}

