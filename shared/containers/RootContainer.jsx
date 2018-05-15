import { connect } from 'react-redux'

import { addWallet, getHistory, updateLoader } from '../redux/actions'
import Root from '../components/Root'

function mapStateToProps(state) {
    return {
        loader: state.loader.visible
    }
}

function mapStateToDispatch(dispatch) {
    return {
        addWallet: () => dispatch(addWallet()),
        getHistory: () => dispatch(getHistory()),
        updateLoader: () => dispatch(updateLoader())
    }
}

export default connect(
    mapStateToProps, 
    mapStateToDispatch
)(Root)
