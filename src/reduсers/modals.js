import { OPEN_MODALS, CLOSE_MODALS } from '../actions/index'

function reducer(state = {}, action) {
    switch(action.type) {
        case OPEN_MODALS:
            return state = { name: action.name, open: action.open }

        case CLOSE_MODALS:
            return state = { }

        default:
            return state
    }
}

export default reducer