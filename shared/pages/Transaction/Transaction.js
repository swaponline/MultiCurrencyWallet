import { withRouter } from 'react-router-dom';
import React, { Component, Fragment } from 'react'
import actions from 'redux/actions'
import { constants } from 'helpers'
import getCurrencyKey from "helpers/getCurrencyKey";
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import getWalletLink from 'helpers/getWalletLink'
import { links } from 'helpers'
import TxInfo from './TxInfo'
import { ModalBox } from 'components/modal'
import cssModules from 'react-css-modules'
import styles from './styles.scss'


const labels = defineMessages({
  Title: {
    id: 'InfoPay_1',
    defaultMessage: 'Transaction is completed',
  },
})

@injectIntl
@cssModules({
  ...styles,
}, { allowMultiple: true })
class Transaction extends Component {
  unmounted = false

  constructor(props) {
    super(props)

    const {
      history,
      match: {
        params: {
          ticker = null,
          tx: txId = null,
        }
      } = null
    } = props



    const currency = getCurrencyKey(ticker)

    this.state = {
      currency,
      ticker,
      txId,
      isFetching: true,
      infoTx: false,
      amount: 0,
      balance: 0,
      oldBalance: 0,
      confirmed: false,
      sender: ``,
      toAddress: ``,
    }
  }

  async fetchTxInfo(currencyKey, txId) {
    const infoTx = await actions[currencyKey].fetchTxInfo(txId, 5*60*1000)

    if(!infoTx) {
      // Fail parse
      return
    }

    if (!this.unmounted) {
      const {
        amount,
        afterBalance: oldBalance,
        confirmed,
        senderAddress: sender,
        receiverAddress: toAddress,
      } = infoTx

      this.setState({
        isFetching: false,
        infoTx,
        amount,
        balance:0,
        oldBalance,
        confirmed,
        sender,
        toAddress,
      })
    }
  }

  componentDidMount() {
    const {
      currency,
      txId,
    } = this.state

    if(!txId) {
      history.push(links.notFound)
      return
    }

    this.fetchTxInfo(currency, txId)

    if (typeof document !== 'undefined') {
      document.body.classList.add('overflowY-hidden-force')
    }
  }

  handleClose = () => {
    const { history } = this.props

    let {
      infoTx: {
        senderAddress: walletOne,
        receiverAddress: walletTwo,
      },
      ticker,
    } = this.state

    const wallets = []
    if (walletOne instanceof Array) {
      walletOne.forEach((wallet) => wallets.push(wallet))
    } else wallets.push(walletOne)
    
    if (walletTwo instanceof Array) {
      walletTwo.forEach((wallet) => wallets.push(wallet))
    } else wallets.push(walletTwo)

    const walletLink = getWalletLink(ticker, wallets)
    history.push((walletLink) ? walletLink : '/')
  }

  componentWillUnmount() {
    this.unmounted = true

    if (typeof document !== 'undefined') {
      document.body.classList.remove('overflowY-hidden-force')
    }
  }

  render() {
    const {
      intl,
    } = this.props

    const {
      isFetching,
      txId,
      currency,
      amount,
      balance,
      oldBalance,
      confirmed,
      sender,
      toAddress,
    } = this.state

    return (
      <ModalBox title={intl.formatMessage(labels.Title)} onClose={this.handleClose} >
        <div styleName="holder">
          <TxInfo 
            isFetching={isFetching}
            txId={txId}
            currency={currency}
            amount={amount}
            balance={balance}
            oldBalance={oldBalance}
            confirmed={confirmed}
            sender={sender}
            toAddress={toAddress}
          />
        </div>
      </ModalBox>
    )
  }
}

export default withRouter(Transaction);
