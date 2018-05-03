import { connect } from 'react-redux'

import { getHistory } from '../redux/actions'
import { getFilteredHistory } from '../redux/reduсers'
import History from './../components/History/History'

function mapStateToProps(state, ownProps) {
    return {
        history: getFilteredHistory(state)
    };
}

const HistoryContainer = connect(mapStateToProps, null)(History);

export default HistoryContainer;