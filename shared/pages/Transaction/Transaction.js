import { withRouter } from 'react-router-dom';
import React, { Component, Fragment } from 'react'
import actions from 'redux/actions'
import { constants } from 'helpers'
import getCurrencyKey from "helpers/getCurrencyKey";

/**
 * 
 * 
    actions.modals.open(constants.modals.InfoPay, {
      amount,
      currency,
      balance,
      oldBalance: 0, // @Todo доделать old balance
      txId,
      toAddress: to
    })
 */

class Transaction extends Component {
  async componentWillMount() {

    let { match: { params: { fullName = null, tx=null } } = null } = this.props

    if(!tx) {
      return;
    }
    const infoTx = await actions[getCurrencyKey(fullName)].fetchTxInfo(tx)
    if(!infoTx) {
      return
    }
    actions.modals.open(constants.modals.InfoPay, {
      amount:infoTx.valueOut,
      currency:fullName,
      balance:0,
      oldBalance: 0, // @Todo доделать old balance
      txId: tx,
      toAddress: infoTx.receiverAddress,
      onClose: () => {
        
        return false;
      }
    })
  }

  render() {

    return <div>
      
    </div>
  }
}

export default withRouter(Transaction);
