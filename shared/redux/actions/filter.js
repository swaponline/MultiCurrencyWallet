import reducers from 'redux/core/reducers'


const setFilter = (filter) => {
  reducers.history.setFilter(filter)
}


export default {
  setFilter,
}
