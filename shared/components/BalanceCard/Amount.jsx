import React from 'react'

class Amount extends React.Component {

    constructor(props) {
        super(props)

        this.input = React.createRef()
        this.minAmount = React.createRef()

        this.setBalance = this.setBalance.bind(this)
    }

    setBalance = balance => {
        let element = this.input.current 
        element.value = balance
    }

    render() {
        const { currency, balance, ref } = this.props
        return(
            <div className="form-group">
                <label>Amount</label>
                <div className="input-group mb-3">
                <input className="form-control" defaultValue="3" ref={this.input} required=""   type="text"  />
                <div className="input-group-append">
                    <span className="input-group-text">{ currency }</span>
                </div>

                </div>
                    <p className="list-text">min: <a 
                    href="#"
                    ref={this.minAmount}
                    onClick={ () => this.setBalance(this.minAmount.current.textContent) } >
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