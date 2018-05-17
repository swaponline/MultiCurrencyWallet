import { connect } from 'react-redux'

import User from '../components/User/User'
import { openModal, updateNotification } from '../redux/actions'

function mapStateToProps(state) {
  return {
    open: state.notification.open,
    name: state.notification.name,
    data: state.notification.data,
  }
}

function mapStateToDispatch(dispatch) {
  return {
    isOpen: (name, open, data) => dispatch(openModal(name, open, data)),
    isUpdate: (name, open, data) => dispatch(updateNotification(name, open, data)),
  }
}

export default connect(
  mapStateToProps,
  mapStateToDispatch
)(User)
