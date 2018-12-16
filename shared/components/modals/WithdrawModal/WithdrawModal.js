import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { constants } from 'helpers'
import actions from 'redux/actions'
import Link from 'sw-valuelink'
import { connect } from 'redaction'
import config from 'app-config'

import cssModules from 'react-css-modules'
import styles from './WithdrawModal.scss'

import Modal from 'components/modal/Modal/Modal'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import ReactTooltip from 'react-tooltip'

import { isCoinAddress } from 'swap.app/util/typeforce'


const minAmount = {
  eth: 0.001,
  btc: 0.00015,
  ltc: 0.1,
  eos: 1,
  tlos: 1,
  noxon: 1,
  swap: 1,
  jot: 1,
}

@injectIntl
@connect(
  ({
    currencies,
    user: { ethData, btcData, /* bchData, */ tokensData, eosData, telosData, nimData, usdtData, ltcData },
  }) => ({
    currencies: currencies.items,
    items: [ ethData, btcData, eosData, telosData, /* bchData, */ ltcData, usdtData /* nimData */ ],
    tokenItems: [ ...Object.keys(tokensData).map(k => (tokensData[k])) ],
  })
)
@cssModules(styles)
export default class WithdrawModal extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object,
  }

  state = {
    isShipped: false,
    address: '',
    amount: '',
    minus: '',
    ethBalance: null,
    tokenFee: false,
  }

  componentWillMount() {

    const { name, data, tokenItems }  = this.props
    const { currency, ethBalance, tokenFee } = this.state

    this.setBalanceOnState(this.props.data.currency)

    Object.keys(config.erc20)
      .forEach(key => {
        if (data.currency === config.erc20[key].fullName) {
          this.setState({ tokenFee: true })

        }
      })
  }

  setBalanceOnState = async (currency) => {
    const { data: { unconfirmedBalance } } = this.props

    const balance = await actions[currency.toLowerCase()].getBalance(currency.toLowerCase())

    const finalBalance = unconfirmedBalance !== undefined && unconfirmedBalance < 0
      ? Number(balance) + Number(unconfirmedBalance)
      : balance

    const ethBalance = await actions.eth.getBalance()

    this.setState(() => ({
      balance: finalBalance,
      ethBalance,
    }))
  }

  handleSubmit = () => {
    const { address: to, amount } = this.state
    const { data: { currency, contractAddress, address, balance, decimals }, name } = this.props

    this.setState(() => ({ isShipped: true }))

    this.setBalanceOnState(currency)

    actions[currency.toLowerCase()].send(contractAddress || address, to, Number(amount), decimals)
      .then(() => {
        actions.loader.hide()
        actions[currency.toLowerCase()].getBalance(currency)
        this.setBalanceOnState(currency)

        actions.notifications.show(constants.notifications.SuccessWithdraw, {
          amount,
          currency,
          address: to,
        })

        this.setState(() => ({ isShipped: false }))
        actions.modals.close(name)
      })
  }


    sellAllBalance = () => {
      const { amount, balance } = this.state
      const { data } = this.props
      const balanceMiner = balance !== 0
        ? Number(balance) - minAmount[data.currency.toLowerCase()]
        : balance
      this.setState({
        amount: balanceMiner,
      })
    }

    isEthOrERC20() {
      const { name, data, tokenItems }  = this.props
      const { currency, ethBalance, tokenFee } = this.state
      return (
        (data.currency === 'eth' || tokenFee === true && ethBalance < minAmount.eth) ? ethBalance < minAmount.eth : false
      )
    }

    addressIsCorrect() {
      const { data } = this.props
      const { address } = this.state

      return isCoinAddress[data.currency.toUpperCase()](address)
    }

    render() {
      const { address, amount, balance, isShipped, minus, ethBalance, tokenFee } = this.state
      const { name, data, tokenItems } = this.props

      const linked = Link.all(this, 'address', 'amount')


      const isDisabled =
        !address || !amount || isShipped || Number(amount) < minAmount[data.currency.toLowerCase()]
        || !this.addressIsCorrect()
        || Number(amount) + minAmount[data.currency.toLowerCase()] > balance
        || this.isEthOrERC20()

      if (Number(amount) !== 0) {
        linked.amount.check((value) => Number(value) + minAmount[data.currency.toLowerCase()] <= balance,
          <div style={{ width: '340px', fontSize: '12px' }}>
            <FormattedMessage id="Withdrow108" defaultMessage="The amount must be less than your balance on the miners fee " />
            {minAmount[data.currency.toLowerCase()]}
          </div>
        )
        linked.amount.check((value) => Number(value) > minAmount[data.currency.toLowerCase()],
          !tokenFee &&
          (
            <div style={{ width: '340px', fontSize: '12px' }}>
              <FormattedMessage id="Withdrow159" defaultMessage="Amount must be greater than  " />
              {minAmount[data.currency.toLowerCase()]}
            </div>
          )
        )
      }

      if (this.state.amount < 0) {
        this.setState({
          amount: '',
          minus: true,
        })
      }

      const title = [
        <FormattedMessage id="Withdraw18333" defaultMessage={`Withdraw {data}`} values={{ data: `${data.currency.toUpperCase()}` }} />,
      ]

      return (
        <Modal name={name} title={title}>
          { tokenFee &&
            (
              <p style={{ fontSize: '16px', textAlign: 'center', color: 'red' }}>
                <FormattedMessage
                  id="Withdrow183"
                  defaultMessage={`Please note: Miners fee is {values} ETH {br}Your balance must exceed this sum to perform transaction.`}
                  values={{ minAmount: `${minAmount.eth}`, br: <br /> }} />
              </p>
            )
          }
          {!tokenFee &&
            (
              <p style={{ fontSize: '16px', textAlign: 'center' }}>
                <FormattedMessage
                  id="Withdrow192"
                  defaultMessage="Please note: Miners fee is {minAmount} {data}.  {br}Your balance must exceed this sum to perform transaction. "
                  values={{ minAmount: `${minAmount[data.currency.toLowerCase()]}`, br: <br />, data: `${data.currency.toUpperCase()}` }} />
              </p>
            )
          }
          <FieldLabel inRow>
            <FormattedMessage id="Withdrow1194" defaultMessage="Address " />
            {' '}
            <Tooltip id="WtH203" >
              <div style={{ textAlign: 'center' }}>
                <FormattedMessage
                  id="WTH275"
                  defaultMessage="Make sure the wallet you {br}are sending the funds to supports {currency}"
                  values={{ br: <br />, currency: `${data.currency.toUpperCase()}` }}
                />
              </div>
            </Tooltip>
          </FieldLabel>
          <Input valueLink={linked.address} focusOnInit pattern="0-9a-zA-Z" placeholder={`Enter ${data.currency.toUpperCase()} address to transfer the funds`} />
          {address && !this.addressIsCorrect() && (
            <div styleName="rednote">
              <FormattedMessage
                id="WithdrawIncorectAddress"
                defaultMessage="Your address not correct" />
            </div>
          )}
          <p style={{ marginTop: '20px' }}>
            <FormattedMessage id="Withdrow113" defaultMessage="Your balance: " />
            {Number(balance).toFixed(5)}
            {' '}
            {data.currency.toUpperCase()}
          </p>
          <FieldLabel inRow>
            <FormattedMessage id="Withdrow118" defaultMessage="Amount " />
          </FieldLabel>
          <div styleName="group">
            <Input styleName="input" valueLink={linked.amount} pattern="0-9\." placeholder={`Enter the amount. You have ${Number(balance).toFixed(5)}`} />
            <buttton styleName="button" onClick={this.sellAllBalance} data-tip data-for="Withdrow134">
              <FormattedMessage id="Select210" defaultMessage="MAX" />
            </buttton>
            <ReactTooltip id="Withdrow134" type="light" effect="solid">
              <FormattedMessage
                id="WithdrawButton32"
                defaultMessage="when you click this button, in the field, an amount equal to your balance minus the miners commission will appear" />
            </ReactTooltip>
          </div>
          {
            !linked.amount.error && (
              <div styleName={minus ? 'rednote' : 'note'}>
                <FormattedMessage id="WithdrawModal106" defaultMessage="No less than " />
                {' '}
                {minAmount[data.currency.toLowerCase()]}
              </div>
            )
          }
          <Button styleName="buttonFull" brand fullWidth disabled={isDisabled} onClick={this.handleSubmit}>
            <FormattedMessage id="WithdrawModal111" defaultMessage="Withdraw" />
            {' '}
            {data.currency.toUpperCase()}
          </Button>
        </Modal>
      )
    }
}
