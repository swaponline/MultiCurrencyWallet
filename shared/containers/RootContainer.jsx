import { connect } from 'react-redux'

import { updateLoader } from '../redux/actions'
import Root from '../components/Root'

function mapStateToProps(state) {
    return {
        loader: state.loader
    }
}

function mapStateToDispatch(dispatch) {
    return {
        updateLoader: () => dispatch(updateLoader())
    }
}

export default connect(
    mapStateToProps, 
    mapStateToDispatch
)(Root)
