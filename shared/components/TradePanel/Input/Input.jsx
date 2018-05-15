import React from 'react'
import PropTypes from 'prop-types'
import './Input.scss'

const Input = ({ currency, row = ''}) => (
    <div className={'trade-panel__group ' + row}>
        {/*<input type="number" placeholder="0" className="trade-panel__input" />*/}
        <select name="" id="" className="trade-panel__select" defaultValue={currency}>
            <option value="ETH">ETH</option>
            <option value="BTC">BTC</option>
        </select>
    </div>
)

Input.propTypes = {
    currency: PropTypes.string.isRequired,
    row: PropTypes.string
}

export default Input