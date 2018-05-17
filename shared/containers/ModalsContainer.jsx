import { connect } from 'react-redux'

import { closeModal, updateNotification } from '../redux/actions'
import ModalRoot from '../components/Modals/Modals'

function mapStateToProps(state) {
  return {
    name: state.modals.name,
    open: state.modals.open,
    ...state.modals,
  }
}

function mapStateToDispatch(dispatch) {
  return {
    isClose: () => dispatch(closeModal()),
    isUpdate: (name, open, data) => dispatch(updateNotification(name, open, data)),
  }
}
export default connect(
  mapStateToProps,
  mapStateToDispatch
)(ModalRoot)
