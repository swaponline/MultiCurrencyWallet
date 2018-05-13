import { connect } from 'react-redux'

import User from '../components/User/User'
import { openModal } from '../redux/actions'

function mapStateToProps(state) {
    return {
        notification: state.notification,
        ...state.notification
    }
}

function mapStateToDispatch(dispatch) {
    return {
        isOpen: (name, open) => dispatch(openModal(name, open))
    }
}

export default connect(
    mapStateToProps,
    mapStateToDispatch
)(User);
