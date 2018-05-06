import { connect } from 'react-redux'

import { closeModal } from '../actions/index'
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
export default connect(
    mapStateToProps, 
    mapStateToDispatch
)(ModalRoot)
