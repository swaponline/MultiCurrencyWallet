import React from 'react'

import './Input.scss'

const Input = ({ currency, row = ''}) => (
    <div className={'trade-panel__group ' + row}>
        {/*<input type="number" placeholder="0" className="trade-panel__input" />*/}
        <select name="" id="" className="trade-panel__select" defaultValue={currency}>
            <option value="ETH">ETH</option>
            <option value="BTC">BTC</option>
        </select>
    </div>
);

export default Input