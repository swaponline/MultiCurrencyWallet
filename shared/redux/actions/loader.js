import { CLOSE_LOADER } from '../constants'

export const updateLoader = (action) => ({
  type: CLOSE_LOADER,
  payload: action,
})
