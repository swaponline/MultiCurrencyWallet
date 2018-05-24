import reducers from 'redux/core/reducers'


const show = () => reducers.loader.setVisibility(true)
const hide = () => reducers.loader.setVisibility(false)


export default {
  show,
  hide,
}
