import { SET_FILTER } from '../actions/index'

export default (state = 'ALL', action) => {
    switch (action.type) {
        case SET_FILTER:
            return action.filter

        default:
            return state
    }
}
