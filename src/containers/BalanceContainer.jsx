import React from 'react'
import { connect } from 'react-redux'
import Wallet from '../components/Balances/Wallet'
import '../components/Balances/Balances.scss'
import PropTypes from "prop-types"


const BalanceContainer = ({ wallets }) => (
    <div className="trades-table">
        <div className="container">
            <table className="table">
                <tbody>
                {wallets.map(wallet =>
                    <Wallet
                        key={wallet.id}
                        {...wallet}
                    />
                )}
                </tbody>
            </table>
        </div>
    </div>
)

BalanceContainer.propTypes = {
    wallets: PropTypes.arrayOf(PropTypes.shape({
        currency: PropTypes.string.isRequired,
        balance: PropTypes.number.isRequired,
        address: PropTypes.string.isRequired,
    }).isRequired).isRequired,
}

const mapStateToProps = state => ({
    wallets: state.wallets
});

export default connect(mapStateToProps)(BalanceContainer)