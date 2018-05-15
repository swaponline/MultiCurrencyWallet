import { OPEN_MODALS, CLOSE_MODALS } from '../constants'

export default (state = {}, action) => {
    switch(action.type) {
        case OPEN_MODALS:
            return state = { name: action.name, open: action.open, ...action.data}

        case CLOSE_MODALS:
            return state = { }

        default:
            return state
    }
}
