import { SET_FILTER } from '../constants'

export default (state = 'ALL', action) => {
  switch (action.type) {
    case SET_FILTER:
      return  action.payload

    default:
      return state
  }
}
