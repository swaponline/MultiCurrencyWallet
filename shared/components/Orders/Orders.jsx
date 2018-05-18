import React, { Component } from 'react'

import Coin1Svg from './coin-1.svg'
import Coin2Svg from './coin-2.svg'

import CSSModules from 'react-css-modules'
import styles from './Orders.scss'

import HeadTable from '../HeadTable/HeadTable'
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
        <div className="trades-table">
          <div styleName="container">
            <table styleName="table">
              <thead>
                <tr>
                  <th>
                    <div styleName="table__headers">
                      <span styleName="table__titles">EXCHANGE</span>
                    </div>
                  </th>
                  <th>
                    <div styleName="table__headers">
                      <span styleName="table__titles">PRICE</span>
                    </div>
                  </th>
                  <th>
                    <div styleName="table__headers">
                      <span styleName="table__titles">LIMITS</span>
                    </div>
                  </th>
                  <th>
                    <div styleName="table__headers">
                      <span styleName="table__titles">EXCHANGE</span>
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
                    <div styleName="table__price">...
                      <span styleName="table__currency">works</span>
                    </div>
                  </td>
                  <td>
                    <div styleName="table__limits">...
                      <span styleName="table__currency">works</span>
                    </div>
                  </td>
                  <td>
                    <div styleName="table__rating">...
                      <span styleName="table__currency">works</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )
    }
}
