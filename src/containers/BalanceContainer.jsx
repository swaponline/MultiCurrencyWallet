import React from 'react'
import { connect } from 'react-redux'

import Balance from '../components/Balances/Balance'

function mapStateToProps(state) {
    return {
        wallets: state.wallets
    }
}

export default connect(
    mapStateToProps,
    null
)(Balance)