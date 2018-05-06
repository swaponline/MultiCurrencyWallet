import { ADD_WALLET } from '../actions/index'

export default function reducer(state = [], action) {
    switch (action.type) {
        case ADD_WALLET:
            return action.wallets

        default:
            return state
    }
}