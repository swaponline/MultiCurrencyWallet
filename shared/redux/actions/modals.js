export const OPEN_MODALS = 'OPEN_MODALS'
export const CLOSE_MODALS = 'CLOSE_MODALS'

export const openModal = (name, open = true) => ({
    type: OPEN_MODALS,
    name,
    open
})

export const closeModal = () => ({
    type: CLOSE_MODALS
})
