import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './Body.scss'

import Coin from './coin-1.svg'

function Body() {
    return(
        <tbody>
            <tr>
                <td>
                    <div styleName="table__coins">
                        <span styleName="table__coin-left" className="coin-btc">
                            <img src={Coin} alt=""/>
                        </span>
                    </div>
                </td>
                <td>
                    <div styleName="table__name">Bitcoin</div>
                </td>
                <td>
                    <div styleName="table__balance">248.90037000</div>
                </td>
                <td>
                    <div styleName="table__key">0x5ee7c14f62786add137fe729a88e870e8187b92d</div>
                </td>
                <td>
                    <a href="#" styleName="table__withdraw">Withdraw</a>
                </td>
            </tr>                        
        </tbody>
    );
}

Body.propTypes = {

};

export default CSSModules(Body, styles)

