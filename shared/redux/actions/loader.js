import reducers from 'redux/core/reducers'


const show = (isVisible, text, txId, swap, data) => reducers.loader.setVisibility({ isVisible, text, txId, swap, data })
const hide = () => reducers.loader.setVisibility({})


export default {
  show,
  hide,
}
