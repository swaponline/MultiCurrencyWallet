export const OPEN_MODALS = 'OPEN_MODALS'
export const CLOSE_MODALS = 'CLOSE_MODALS'

export function openModal(name, open = true) {
    return {
        type: OPEN_MODALS,
        name,
        open  
    }
}

export function closeModal() {
    return {
            type: CLOSE_MODALS
        }
}


