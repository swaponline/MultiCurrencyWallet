import React from 'react'

class Amount extends React.Component {

    constructor(props) {
        super(props)

        this.setBalance = this.setBalance.bind(this)
    }

    setBalance = balance => {
        this.input.value = balance
        this.props.setAmount(balance)
    }

    render() {
        const { currency, balance, setAmount } = this.props
        return(
            <div className="form-group">
                <label>Amount</label>
                <div className="input-group mb-3">
                <input 
                    className="form-control"
                    defaultValue="3"
                    ref={ input => this.input = input }
                    onChange={ () => setAmount(this.input.value) } 
                    required=""
                    type="text"  
                />
                <div className="input-group-append">
                    <span className="input-group-text">{ currency }</span>
                </div>

                </div>
                    <p className="list-text">min: <a 
                    href="#"
                    ref={ a => this.minAmount = a } 
                    onClick={ () => this.setBalance(this.minAmount.textContent) } >
                    { currency === 'btc' ? '0.1' : '0.01' }</a>
                    , max <a 
                    href="#" 
                    onClick={ () => this.setBalance(balance) }>{ balance }</a>
                </p>
            </div>
        )
    }    
}

export default Amount