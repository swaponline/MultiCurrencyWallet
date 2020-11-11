import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import { links, constants }    from 'helpers'
import actions from 'redux/actions'

import cssModules from 'react-css-modules'
import styles from './Row.scss'
import { withRouter } from 'react-router-dom'

import Coin from 'components/Coin/Coin'
import Flip from 'components/controls/Flip/Flip'
import { FormattedMessage, injectIntl } from 'react-intl'
import { localisedUrl } from 'helpers/locale'
import BtnTooltip from 'components/controls/WithdrawButton/BtnTooltip'


@injectIntl
@withRouter
@cssModules(styles)
export default class Row extends Component<any, any> {

  static propTypes = {
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
  }

  handlePush = () => {
    const { from, to, intl: { locale } } = this.props
    this.props.history.push(localisedUrl(locale, `/${from.toLowerCase()}-${to.toLowerCase()}`))
  }

  render() {
    const { from, to, intl: { locale } } = this.props

    return (
      <tr styleName="exchangeTr">
        <td>
          <span>
            <div styleName="exchangeRow">
              <Coin styleName="coin" name={from} size={40} />
              {from.toUpperCase()}
              <Flip />
              <Coin styleName="coin" name={to} size={40} />
              {to.toUpperCase()}
            </div>
          </span>
        </td>
        <td>
          <BtnTooltip onClick={this.handlePush} text="Exchange" >
            <FormattedMessage id="Row35" defaultMessage="Exchange" />
          </BtnTooltip>
        </td>
      </tr>
    )
  }
}
