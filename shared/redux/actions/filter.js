import reducers from 'redux/core/reducers'


export const setFilter = (filter) => {
  reducers.history.setFilter(filter)
}

