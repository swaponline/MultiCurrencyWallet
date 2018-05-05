import { connect } from 'react-redux'

import User from '../components/User/User'
import { openModal } from '../actions/index'

function mapStateToDispatch(dispatch) {
    return {
        isOpen: (name, open) => dispatch(openModal(name, open))
    }
}

const UserContainer = connect(null, mapStateToDispatch)(User);

export default UserContainer;