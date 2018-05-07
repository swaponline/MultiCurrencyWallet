import { ADD_WALLET } from '../actions/index'

export default (state = [], action) => {
    switch (action.type) {
        case ADD_WALLET:
            return action.data

        default:
            return state
    }
}