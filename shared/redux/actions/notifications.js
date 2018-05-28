import reducers from 'redux/core/reducers'


const show = (name, data) => reducers.notifications.show({ name, data })

const hide = (name) => reducers.notifications.hide(name)


export default {
  show,
  hide,
}
