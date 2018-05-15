import { UPDATE_NOTIFICATION } from '../constants'

export default (state = {}, action) => {
    switch(action.type) {
        case UPDATE_NOTIFICATION:
            return state = { name: action.name, open: action.open, ...action.data}

        default:
            return state
    }
}