import reducers from 'redux/core/reducers'


const show = (isVisible, text) => reducers.loader.setVisibility({ isVisible, text })
const hide = () => reducers.loader.setVisibility({ isVisible: false })


export default {
  show,
  hide,
}
