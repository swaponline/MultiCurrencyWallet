import React from 'react'

import cssModules from 'react-css-modules'
import styles from './ConfirmPopup.scss'

import { FormattedMessage, injectIntl } from 'react-intl'

import { BigNumber } from 'bignumber.js'

import Popup from 'components/Popup/Popup'
import { Button } from 'components/controls'

import PAIR_TYPES from 'helpers/constants/PAIR_TYPES'


@injectIntl
@cssModules(styles, { allowMultiple: true })
export default class ConfirmPopup extends React.PureComponent {

  handleConfirm = () => {
    this.props.close()
    this.props.confirm()
  }

  render() {
    const { active, close, confirm, pair, exchangeRates } = this.props
    const { price, amount, total, main, base, type } = pair

    return (
      <Popup
        active={active}
        onClickOverlay={close}
      >
        <h3 styleName="Popup__title">
          <FormattedMessage
            id="ConfirmPopupTitle"
            defaultMessage="Confirm action"
          />
        </h3>
        <br />
        <div styleName="Popup__text">
          <FormattedMessage
            id="ConfirmPopupMessage1"
            defaultMessage="Do you want to {action} {amount} {main} for {total} {base} at price {exchangeRates} {main}/{base} ?"
            values={{
              action: type === PAIR_TYPES.BID
                ? <FormattedMessage id="ConfirmPopupAction1" defaultMessage="sell" />
                : <FormattedMessage id="ConfirmPopupAction2" defaultMessage="buy" />,
              amount: amount.toFixed(5),
              main,
              total: total.toFixed(5),
              base,
              exchangeRates,
            }}
          />
        </div>
        <br />
        <br />

        <div styleName="Popup__btnContainer">
          <Button gray onClick={close}>
            <FormattedMessage id="ConfirmPopupNo" defaultMessage="No" />
          </Button>
          <Button brand onClick={this.handleConfirm}>
            <FormattedMessage id="ConfirmPopupYes" defaultMessage="Yes" />
          </Button>
        </div>
      </Popup>
    )
  }
}
