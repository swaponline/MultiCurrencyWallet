import { withRouter } from 'react-router-dom'
import React, { Component } from 'react'
import actions from 'redux/actions'
import erc20Like from 'common/erc20Like'
import {
  links,
  routing,
  localStorage,
  getCurrencyKey,
  lsDataCache,
  transactions
} from 'helpers'

import { defineMessages, injectIntl } from 'react-intl'

import TxInfo from './TxInfo'
import { ModalBox } from 'components/modal'
import cssModules from 'react-css-modules'
import styles from './styles.scss'

import { COIN_DATA } from 'swap.app/constants/COINS'


const labels = defineMessages({
  Title: {
    id: 'InfoPay_1',
    defaultMessage: 'Transaction is completed',
  },
})

@cssModules({
  ...styles,
}, { allowMultiple: true })
class Transaction extends Component<any, any> {
  unmounted = false

  constructor(props) {
    super(props)

    const {
      match: {
        params: {
          ticker = null,
          tx: txHash = null,
        },
      } = null,
    } = props

    const currency = getCurrencyKey(ticker, true)
    const infoTx = lsDataCache.get(`TxInfo_${currency.toLowerCase()}_${txHash}`)

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

    const hiddenCoinsList = localStorage.getItem('hiddenCoinsList')

    const userWallet = actions.core
      .getWallets({})
      .filter(({ currency: walletCurrency, tokenKey }) =>
        !hiddenCoinsList?.includes(walletCurrency) &&
        (tokenKey?.toLowerCase() || walletCurrency.toLowerCase()) === currency.toLowerCase()
      )[0]

    this.state = {
      currency,
      userAddress: userWallet?.address,
      ticker,
      txHash,
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

  fetchTxInfo = async (currency, txHash, ticker) => {
    const {
      infoTx: cachedTxInfo,
    } = this.state

    let infoTx
    let error = null

    try {
      if (erc20Like.isToken({ name: currency })) {
        const tokenStandard = COIN_DATA[currency.toUpperCase()].standard.toLowerCase()
        infoTx = await actions[tokenStandard].fetchTokenTxInfo(ticker, txHash)
      } else {
        infoTx = await actions[currency].fetchTxInfo(txHash, 5 * 60 * 1000)
      }
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
        key: `TxInfo_${currency.toLowerCase()}_${txHash}`,
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
    const {
      ticker,
      txHash,
    } = this.state

    if (!txHash) {
      //@ts-ignore
      history.push(links.notFound)
      return
    }

    const currency = getCurrencyKey(ticker, true)

    this.fetchTxInfo(currency, txHash, ticker)
    this.fetchTxFinalBalances(getCurrencyKey(ticker, true), txHash)

    if (typeof document !== 'undefined') {
      document.body.classList.add('overflowY-hidden-force')
    }
  }

  fetchTxFinalBalances = (currency, txHash) => {
    setTimeout(async () => {
      const finalBalances = await transactions.fetchTxBalances(currency, txHash)
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

    const wallets: IUniversalObj[] = []

    if (walletOne instanceof Array) {
      walletOne.forEach((wallet) => wallets.push(wallet))
    } else {
      wallets.push(walletOne)
    }

    if (walletTwo instanceof Array) {
      walletTwo.forEach((wallet) => wallets.push(wallet))
    } else {
      wallets.push(walletTwo)
    }

    const walletLink = routing.getWalletLink(ticker, wallets)
    history.push((walletLink) || '/')
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

    return (
      <ModalBox title={intl.formatMessage(labels.Title)} onClose={this.handleClose} >
        <div styleName="holder">
          <TxInfo {...this.state} />
        </div>
      </ModalBox>
    )
  }
}

export default withRouter(injectIntl(Transaction))
