import React, { Component } from 'react'

import Coin1Svg from './coin-1.svg'
import Coin2Svg from './coin-2.svg'

import './Orders.scss'
import Swap from '../controls/Swap/Swap'

import HeadTable from '../HeadTable/HeadTable'
// import Orders from '../Orders/Orders'

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
          <div className="container">
            <table className="table">
              <thead>
                <tr>
                  <th><div className="table__headers">EXCHANGE</div></th>
                  <th><div className="table__headers">PRICE</div></th>
                  <th><div className="table__headers">LIMITS</div></th>
                  <th><div className="table__headers">EXCHANGE</div></th>
                </tr>
              </thead>

              <tbody>
                <tr
                  className={this.state.active ? 'active' : ''}
                  onMouseEnter={this.handleChange}
                  onMouseLeave={this.handleChange}
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
                    <div className="table__price">...
                      <span className="table__currency">works</span>
                    </div>
                  </td>

                  <td>
                    <div className="table__limits">...
                      <span className="table__currency">works</span>
                    </div>
                  </td>

                  <td>
                    <div className="table__rating">...
                      <span className="table__currency">works</span>
                    </div>
                  </td>

                  <td>
                    <Swap />
                  </td>
                </tr>
              </tbody>

            </table>
          </div>
        </div>
      )
    }
}
