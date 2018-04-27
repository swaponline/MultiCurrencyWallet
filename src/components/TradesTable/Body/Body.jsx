import React from 'react'

import Coin1Svg from './coin-1.svg'
import Coin2Svg from './coin-2.svg'

import CSSModules from 'react-css-modules'
import styles from './Body.scss'

class Body extends React.Component {

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
                <tr styleName={ this.state.active ? 'active' : '' } 
                    onMouseEnter={ this.handleChange }
                    onMouseLeave={ this.handleChange }
                >
                    <td>
                        <div styleName="table__coins">
                            <span styleName="table__coin-left">
                                <img src={Coin1Svg} alt="" /> 
                            </span>
                            <span styleName="table__coin-right">
                                <img src={Coin2Svg} alt="" /> 
                            </span>
                        </div>
                    </td>
        
                    <td>
                        <div styleName="table__price">0.055777 
                            <span styleName="table__currency">eth</span>
                        </div>
                    </td>
        
                    <td>
                        <div styleName="table__limits">21,400 - 22,051 
                            <span styleName="table__currency">btc</span>
                        </div>
                    </td>
        
                    <td>
                        <div styleName="table__rating">98% 
                            <span styleName="table__currency">10 000+</span>
                        </div>
                    </td>
        
                    <td>
                        <a href="#" styleName="table__link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="7" height="10" viewBox="0 0 7 10">
                                <path styleName="table__link-arrow" fill="none" fillRule="evenodd"
                                        stroke="#7c1de9" strokeLinecap="round" strokeWidth="2"
                                        d="M1 9l4-4-4-4"/>
                            </svg>
                        </a>
                    </td>
                </tr>
            </tbody>
            )
    }
}

export default CSSModules(Body, styles)