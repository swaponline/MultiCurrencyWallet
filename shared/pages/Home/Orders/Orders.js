import React, { Component } from 'react'

import CSSModules from 'react-css-modules'
import styles from './Orders.scss'

import coin1Image from './images/coin-1.svg'
import coin2Image from './images/coin-2.svg'

// import HeadTable from '../HeadTable/HeadTable'
// import Orders from '../Orders/Orders'


@CSSModules(styles)
export default class Orders extends Component {

  state = {
    activeOrderId: null,
  }

  // handleSelectOrder = (orderId) => {
  //     this.setState({
  //         activeOrderId: orderId,
  //     })
  // }

  render() {
    // const { activeOrderId } = this.state
    // const myPeer = app.storage.me.peer

    return (
      <table styleName="table">
        <thead>
          <tr>
            <th>
              <div styleName="headers">
                <span styleName="titles">EXCHANGE</span>
              </div>
            </th>
            <th>
              <div styleName="headers">
                <span styleName="titles">PRICE</span>
              </div>
            </th>
            <th>
              <div styleName="headers">
                <span styleName="titles">LIMITS</span>
              </div>
            </th>
            <th>
              <div styleName="headers">
                <span styleName="titles">EXCHANGE</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            styleName={this.state.active ? 'active' : ''}
            onMouseEnter={this.handleChange}
            onMouseLeave={this.handleChange}
          >
            <td>
              <div styleName="coins">
                <span styleName="coin-left">
                  <img src={coin1Image} alt="" />
                </span>
                <span styleName="coin-right">
                  <img src={coin2Image} alt="" />
                </span>
              </div>
            </td>
            <td>
              <div styleName="price">...
                <span styleName="currency">works</span>
              </div>
            </td>
            <td>
              <div styleName="limits">...
                <span styleName="currency">works</span>
              </div>
            </td>
            <td>
              <div styleName="rating">...
                <span styleName="currency">works</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    )
  }
}
