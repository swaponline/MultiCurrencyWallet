import { connect } from 'react-redux'

import { updateModal, closeModal } from '../actions/index'
import ModalRoot from '../components/Modals/Modals'

function mapStateToProps(state) {
    return {
        modals: state.modals
    }
}

function mapStateToDispatch(dispatch) {
    return {
        isClose: () => dispatch(closeModal())
    }
}

const ModalsContainer = connect(mapStateToProps, mapStateToDispatch)(ModalRoot);

export default ModalsContainer;