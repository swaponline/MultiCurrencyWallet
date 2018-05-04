import { connect } from 'react-redux'

import Balances from './../components/Balances/Balances'
import { createAccount } from '../redux/actions'

function mapStateToProps(state) {
    return {
        account: state.account
    }
}

function mapStateToDispatch(dispatch) {
    return {
        createAccount: account => dispatch(createAccount(account))
    }
}

const BalanceContainer = connect(mapStateToProps, mapStateToDispatch)(Balances);

export default BalanceContainer;