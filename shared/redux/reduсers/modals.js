import { OPEN_MODALS, CLOSE_MODALS } from '../constants'

const initialState = {
  name: '',
  open: false,
}

export default (state = initialState, action) => {
  switch (action.type) {
    case OPEN_MODALS:
      return { ...state,
        name: action.name,
        open: action.open,
        ...action.data,
      }

    case CLOSE_MODALS:
      return initialState

    default:
      return state
  }
}
