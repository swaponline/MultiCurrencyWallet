import { CLOSE_LOADER } from '../constants'

const initialState = {
    visible: true
}


export default (state = initialState, action) => {
    switch (action.type) {
        case CLOSE_LOADER:
            return {  ...state, visible: action.payload }

        default:
            return state
    }
}