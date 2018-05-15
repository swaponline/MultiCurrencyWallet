import { UPDATE_NOTIFICATION } from '../constants'

const initialState = {
    name: '',
    open: false,
    data: {}
}

export default (state = initialState, action) => {
    switch(action.type) {
        case UPDATE_NOTIFICATION:
            return { ...state, 
                name: action.name, 
                open: action.open, 
                data: action.data 
            }

        default:
            return state
    }
}