import { CREATE_ACCOUNT } from '../actions'

function reducer(state = {}, action) {
    switch (action.type) {
        case CREATE_ACCOUNT:
            return action.account;
        default:
            return state
    }
}

export default reducer