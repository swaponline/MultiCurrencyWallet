import { UPDATE_NOTIFICATION } from '../actions/index'

export default (state = {}, action) => {
    switch(action.type) {
        case UPDATE_NOTIFICATION:
            return state = { name: action.name, open: action.open, ...action.data}

        default:
            return state
    }
}