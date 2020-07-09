import { withRouter } from 'react-router-dom';
import React, { Component, Fragment } from 'react'
import actions from 'redux/actions'
import { constants } from 'helpers'
import helpers from 'helpers'
import getCurrencyKey from "helpers/getCurrencyKey";
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import getWalletLink from 'helpers/getWalletLink'
import { links } from 'helpers'
import TxInfo from './TxInfo'
import { ModalBox } from 'components/modal'
import cssModules from 'react-css-modules'
import styles from './styles.scss'
import lsDataCache from 'helpers/lsDataCache'


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

    const currency = getCurrencyKey(ticker, true)
    const infoTx = lsDataCache.get(`TxInfo_${currency.toLowerCase()}_${txId}`)

    let rest = {}
    if (infoTx) {
      const {
        amount,
        afterBalance: oldBalance,
        confirmed,
        senderAddress: sender,
        receiverAddress: toAddress,
        confirmations,
        minerFee,
        minerFeeCurrency,
        adminFee,
      } = infoTx

      rest = {
        amount,
        confirmed,
        sender,
        toAddress,
        oldBalance,
        confirmations,
        minerFee,
        minerFeeCurrency,
        adminFee,
      }
    }

    this.state = {
      currency,
      ticker,
      txId,
      isFetching: !(infoTx),
      infoTx,
      amount: 0,
      balance: 0,
      oldBalance: 0,
      confirmed: false,
      sender: ``,
      toAddress: ``,
      confirmations: 0,
      minerFee: 0,
      error: null,
      finalBalances: false,
      ...rest,
    }
  }

  async fetchTxInfo(currencyKey, txId) {
    const {
      infoTx: cachedTxInfo,
    } = this.state

    let infoTx = null
    let error = null
    try {
      infoTx = await actions[currencyKey].fetchTxInfo(txId, 5 * 60 * 1000)
    } catch (err) {
      console.error(err)
      error = err
    }

    if (!infoTx || error) {
      // Fail parse
      this.setState({
        isFetching: false,
        error: !(cachedTxInfo),
      })
      return
    }

    if (!this.unmounted) {
      lsDataCache.push({
        key: `TxInfo_${currencyKey.toLowerCase()}_${txId}`,
        time: 3600,
        data: infoTx,
      })

      const {
        amount,
        afterBalance: oldBalance,
        confirmed,
        senderAddress: sender,
        receiverAddress: toAddress,
        confirmations,
        minerFee,
        minerFeeCurrency,
        adminFee,
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
        confirmations,
        minerFee,
        minerFeeCurrency,
        adminFee,
      })
    }
  }

  componentDidMount() {
    console.log('Transaction mounted')
    const {
      ticker,
      txId,
    } = this.state

    if(!txId) {
      history.push(links.notFound)
      return
    }

    const currency = getCurrencyKey(ticker)
    this.fetchTxInfo(currency, txId)
    this.fetchTxFinalBalances(getCurrencyKey(ticker, true), txId)

    if (typeof document !== 'undefined') {
      document.body.classList.add('overflowY-hidden-force')
    }
  }

  fetchTxFinalBalances = (currency, txId) => {
    setTimeout(async () => {
      const finalBalances = await helpers.transactions.fetchTxBalances( currency, txId)
      if (finalBalances && !this.unmounted) {
        this.setState({
          finalBalances,
        })
      }
    })
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
    console.log('Transaction unmounted')
    this.unmounted = true

    if (typeof document !== 'undefined') {
      document.body.classList.remove('overflowY-hidden-force')
    }
  }

  render() {
    const {
      intl,
    } = this.props

    return (
      <ModalBox title={intl.formatMessage(labels.Title)} onClose={this.handleClose} >
        <div styleName="holder">
          <TxInfo {...this.state} />
        </div>
      </ModalBox>
    )
  }
}

export default withRouter(Transaction);
