import { UPDATE_LOADER } from '../actions/index'

export default (state = true, action) => {
    switch (action.type) {
        case UPDATE_LOADER:
            return state = false

        default:
            return state
    }
}