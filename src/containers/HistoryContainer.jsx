import { connect } from 'react-redux'

import { getHistory } from '../redux/actions'
import { getFilteredHistory } from '../redux/redusers'
import BodyHistory from './../components/TradesTable/BodyHistory/BodyHistory'

function mapStateToProps(state) {
    return {
        history: getFilteredHistory(state)
    };
}

const HistoryContainer = connect(mapStateToProps, null)(BodyHistory);

export default HistoryContainer;