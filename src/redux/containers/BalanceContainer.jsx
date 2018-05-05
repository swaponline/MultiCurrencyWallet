import { connect } from 'react-redux'

import Balances from '../../components/Balances/Balances'
import { createAccount } from '../actions/index'


const mapStateToProps = state => ({
    account: state.account
});

function mapStateToDispatch(dispatch) {
    return {
        createAccount: account => dispatch(createAccount(account))
    }
}

export default connect(
    mapStateToProps,
    mapStateToDispatch
)(Balances)