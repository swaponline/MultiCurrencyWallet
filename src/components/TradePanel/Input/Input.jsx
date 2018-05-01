import React from 'react'

import './Input.scss'

const Input = ({ icon, currency, row = '' }) => (
    <div className={'trade-panel__group ' + row}>
        <input type="number" placeholder="0" className="trade-panel__input" />
        <select name="" id="" className="trade-panel__select">
            <option value="ETH">ETH</option>
            <option value="BTC">BTC</option>
        </select>
    </div>
);

export default Input