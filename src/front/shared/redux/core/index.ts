import store from 'redux/store'
import reducers from './reducers'


const getState = () => store.getState()


export {
  reducers,
  getState,
}
