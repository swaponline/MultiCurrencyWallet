import reducers from '../core/reducers'

export const setFilter = (filter) => {
  reducers.history.setFilter(filter)
}

