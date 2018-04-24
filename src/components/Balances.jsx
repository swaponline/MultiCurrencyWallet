import React from 'react'
import PropTypes from 'prop-types'

function Balances() {
    return(
<main className="main">
    <div className="description">
        <div className="container">
            <h3 className="description__sub-title">Balances</h3>
        </div>
    </div>
    <div className="trades-table">
        <div className="container">
            <table className="table">
                <thead>
                    <tr>
                        <th><div className="table__headers"><span className="table__titles">Coin</span></div></th>
                        <th><div className="table__headers"><span className="table__titles">Name</span></div></th>
                        <th><div className="table__headers"><span className="table__titles">Available balance</span></div></th>
                        <th><div className="table__headers"><span className="table__titles">Rating</span></div></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><div className="table__coins"><span className="table__coin-left coin-btc"><img src="img/coin-1.svg" alt=""/></span></div></td>
                        <td><div className="table__name">Bitcoin</div></td>
                        <td><div className="table__balance">248.90037000</div></td>
                        <td><div className="table__key">0x5ee7c14f62786add137fe729a88e870e8187b92d</div></td>
                        <td><a href="#" className="table__withdraw">Withdraw</a></td>
                    </tr>                        
                </tbody>
            </table>
        </div>
    </div>
</main>
    );
}

Balances.propTypes = {

};

export default Balances

