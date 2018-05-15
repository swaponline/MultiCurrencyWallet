import { connect } from 'react-redux'

import { getHistory } from '../redux/actions'
import { getFilteredHistory } from '../redux/reduсers'
import History from '../components/History/History'

function mapStateToProps(state) {
    return {
        transactions: getFilteredHistory(state),
        fetching: state.history.fetching
    }
}

export default connect(
    mapStateToProps,
    null
)(History)
