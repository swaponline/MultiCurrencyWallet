import { SET_FILTER } from '../constants'

export const setFilter = (filter) => ({
    type: SET_FILTER,
    payload: filter
})