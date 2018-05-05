import { connect } from 'react-redux'

import { getHistory } from '../actions/index'
import { getFilteredHistory } from '../reduсers/index'
import History from '../components/History/History'

function mapStateToProps(state) {
    return {
        history: getFilteredHistory(state)
    }
}

const HistoryContainer = connect(mapStateToProps, null)(History);

export default HistoryContainer;