import { connect } from 'react-redux'

import { getHistory } from '../redux/actions'
import { getFilteredHistory } from '../redux/reduсers'
import History from '../components/History/History'

function mapStateToProps(state) {
    return {
        history: getFilteredHistory(state)
    }
}

export default connect(
    mapStateToProps,
    null
)(History)
