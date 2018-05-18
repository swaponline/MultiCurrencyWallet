import { connect } from 'react-redux'

import { addWallet, getHistory, updateLoader } from '../redux/actions'
import Root from '../components/Root/Root'

function mapStateToProps(state) {
  return {
    loader: state.loader.visible,
  }
}

function mapStateToDispatch(dispatch) {
  return {
    addWallet: () => dispatch(addWallet()),
    getHistory: () => dispatch(getHistory()),
    updateLoader: (action) => dispatch(updateLoader(action)),
  }
}

export default connect(
  mapStateToProps,
  mapStateToDispatch
)(Root)
