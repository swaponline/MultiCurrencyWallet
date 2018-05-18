import React from 'react'
import PropTypes from 'prop-types'

export default class Address extends React.Component {
  render() {
    const { setAddress, currency } = this.props
    return (
      <div className="form-group">
        <label>Address</label>
        <div className="input-group mb-3">
          <input
            className="form-control"
            ref={input => this.address = input}
            onChange={() => setAddress(this.address.value)}
            required=""
            type="text"
            placeholder="Address"
            pattern={currency === 'eth' ? '(0x){1}[0-9a-fA-F]{40}' : '[a-zA-HJ-NP-Z0-9]{25,34}'}
          />
        </div>
      </div>
    )
  }
}

Address.propTypes = {
  setAddress: PropTypes.func.isRequired,
  currency:  PropTypes.string.isRequired,
}
