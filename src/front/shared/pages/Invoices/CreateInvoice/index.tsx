import React, { Fragment, PureComponent } from 'react'
import PropTypes from 'prop-types'

import { isMobile } from 'react-device-detect'
import { connect } from 'redaction'
import { constants } from 'helpers'
import { localisedUrl } from 'helpers/locale'
import { FormattedMessage, injectIntl } from 'react-intl'
import { withRouter } from 'react-router-dom'
import actions from 'redux/actions'
import { links }    from 'helpers'
import Button from 'components/controls/Button/Button'

import moment from 'moment'

import CSSModules from 'react-css-modules'
import styles from './styles.scss'
import config from 'app-config'


@connect(({
  user: {
    btcData,
    ethData,
    ghostData,
    nextData,
  },
}) => {
  return {
    data: {
      btc: btcData,
      eth: ethData,
      ghost: ghostData,
      next: nextData,
    }
  }
})
@injectIntl
@CSSModules(styles, { allowMultiple: true })
export default class CreateInvoice extends PureComponent<any, any> {

  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    intl: PropTypes.object.isRequired,
  };

  timerWaitOnlineJoin: any

  constructor() {
    //@ts-ignore
    super()

    this.timerWaitOnlineJoin = false
    this.state = {
    }
  }

  async componentDidMount() {
    console.log('CreateInvoice mounted')
    let {
      match: {
        params: {
          type,
          wallet,
        },
      },
      history,
      location: {
        pathname,
      },
      data,
    } = this.props

    if (!data[type]) {
      data[type] = actions.core.getWallet({
        currency: type,
      })
    }
console.log('>>>>>>>', 'type', type, 'wallet', wallet, 'data', data, data[type])
    if (type && wallet && data[type]) {
      const address = data[type].address

      actions.modals.open(constants.modals.InvoiceModal, {
        currency: type.toUpperCase(),
        toAddress: wallet,
        address,
        disableClose: true,
      })

      console.log(type)
      await actions.user.getInfoAboutCurrency([type.toUpperCase()]);

    } else {
      this.props.history.push(localisedUrl(links.notFound))
    }
  }

  async componentWillUnmount() {
    console.log('CreateInvoice unmounted')
  }

  render() {
    return null
  }
}
