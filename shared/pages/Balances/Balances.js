import React, { Component } from 'react'
import { connect } from 'redaction'
import { constants } from 'helpers'
import actions from 'redux/actions'

import PageHeadline from 'components/PageHeadline/PageHeadline'
import Table from 'components/Table/Table'

import Row from './Row/Row'


@connect(({ user: { ethData, btcData, tokenData, eosData, nimData } }) => ({
  items: [ ethData, btcData, tokenData,  eosData /* nimData */ ],
  ethAddress: ethData.address,
  btcAddress: btcData.address,
}))
export default class Balances extends Component {

  componentWillMount() {
    actions.user.getBalances()
    actions.analytics.dataEvent('open-page-balances')
    // if (!localStorage.getItem(constants.localStorage.privateKeysSaved)) {
    //   actions.modals.open(constants.modals.PrivateKeys, {})
    // }
  }

  render() {
    const { items, ethAddress, btcAddress } = this.props
    const titles = [ 'Coin', 'Name', 'Balance', 'Address', '' ]
    const addresses = { ethAddress, btcAddress }

    return (
      <section>
        <PageHeadline subTitle="Balances" />
        <Table
          titles={titles}
          rows={items}
          rowRender={(row, index) => (
            <Row key={index} addresses={addresses} {...row} />
          )}
        />
      </section>
    )
  }
}

// const lightApi = (
//   <div style={{ display: 'flex', position: 'fixed', top: '200px', left: 'calc(50% - 150px)', width: '300px', alignItems: 'center', flexDirection: 'column', padding: '20px 40px', boxShadow: '0 3px 9px 0 rgba(0,0,0,0.8)', background: '#ffffff', borderRadius: '10px'  }}>
//     <button onClick={() => this.setState({ view: false })} style={{ cursor: 'pointer' }} >Close</button>
//     <img src={Images} width="200px" height="200px" alt="" />
//     <input
//       ref={input => this.textInput = input}
//       type="text"
//       style={{ padding: '10px', border: '1px solid #696969' }}
//       defaultValue="lntb40u1pdjujdlpp57r9rjc8a8x7xhhkrr4r57zfds6m0t77rt74qf5d6j5rnwda9fa2qdqqcqzysxqyz5vqxqn582f3hkhl8vcwxugdecrahgx4qk094n0tzzx4pek66utcdv45es542g3gccm349c502lumrmnlvh46la8dfyr8h3ytag4hggtuwgpneywz6"
//     />
//     <button onClick={() => this.handleFocus()} style={{ padding: '10px', boxShadow: '0 3px 9px 0 rgba(0,0,0,0.06)', cursor: 'pointer' }}>Copy</button>
//   </div>
// )
//
// const light = {
//   currency: 'BTC (LIGHTNING NETWORK)',
//   balance: 0.004312,
//   address: <button className={styles.button} onClick={() => this.setState({ view: true })} >Create invoice</button>,
// }
//
// if (items.length < 4) {
//   items.push(light)
// { view && lightApi }
// }