import reducers from 'redux/core/reducers'


const update = (name, open, data) =>
  reducers.notification.update({ name, open, data })


export default {
  update,
}
