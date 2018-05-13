import { connect } from 'react-redux'

import { updateLoader, addWallet, getHistory } from '../redux/actions'
import Root from '../components/Root'

function mapStateToProps(state) {
    return {
        loader: state.loader
    }
}

function mapStateToDispatch(dispatch) {
    return {
        updateLoader: () => dispatch(updateLoader()),
        addWallet: (data) => dispatch(addWallet(data)),
        getHistory: (data) => dispatch(getHistory(data))
    }
}

export default connect(
    mapStateToProps, 
    mapStateToDispatch
)(Root)
