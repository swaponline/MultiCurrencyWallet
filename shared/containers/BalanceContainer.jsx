import React from 'react'
import { connect } from 'react-redux'

import Balance from '../components/Balances/Balance'
import { openModal } from '../redux/actions'

function mapStateToProps(state) {
    return {
        wallets: state.wallets
        
    }
}

function mapStateToDispatch(dispatch) {
    return {
        openModal: (name, open, data) => dispatch(openModal(name, open, data))
    }
}

export default connect(
    mapStateToProps,
    mapStateToDispatch
)(Balance)