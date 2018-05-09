import React from 'react'

import Coin1Svg from './coin-1.svg'
import Coin2Svg from './coin-2.svg'

import './Main.scss'
import Swap from '../controls/Swap/Swap'

class Main extends React.Component {

    constructor() {
        super()

        this.state = {
            active: false
        }

        this.handleChange = this.handleChange.bind(this)
    }

    handleChange() {
        this.setState({ active: !this.state.active })
    }

    render() {
        return (
            <tbody>
                <tr className={ this.state.active ? 'active' : '' }
                    onMouseEnter={ this.handleChange }
                    onMouseLeave={ this.handleChange }
                >
                    <td>
                        <div className="table__coins">
                            <span className="table__coin-left">
                                <img src={Coin1Svg} alt="" /> 
                            </span>
                            <span className="table__coin-right">
                                <img src={Coin2Svg} alt="" /> 
                            </span>
                        </div>
                    </td>
        
                    <td>
                        <div className="table__price">0.055777
                            <span className="table__currency">eth</span>
                        </div>
                    </td>
        
                    <td>
                        <div className="table__limits">21,400 - 22,051
                            <span className="table__currency">btc</span>
                        </div>
                    </td>
        
                    <td>
                        <div className="table__rating">98%
                            <span className="table__currency">10 000+</span>
                        </div>
                    </td>
        
                    <td>
                        <Swap />
                    </td>
                </tr>
            </tbody>
        )
    }
}

export default Main