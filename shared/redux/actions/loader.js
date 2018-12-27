import reducers from 'redux/core/reducers'


const show = (isVisible, data) => reducers.loader.setVisibility({ isVisible, data })
const hide = () => reducers.loader.setVisibility({})


export default {
  show,
  hide,
}
