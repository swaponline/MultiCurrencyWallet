import reducers from 'redux/core/reducers'


const open = (name, data) => reducers.modals.open({ name, data })

const close = (name) => reducers.modals.close(name)


export default {
  open,
  close,
}
