import React, { Fragment, PureComponent } from 'react'
import PropTypes from 'prop-types'

import { isMobile } from 'react-device-detect'
import { connect } from 'redaction'
import { constants } from 'helpers'
import { localisedUrl } from 'helpers/locale'
import { FormattedMessage, injectIntl } from 'react-intl'
import { withRouter } from 'react-router'
import actions from 'redux/actions'
import { links }    from 'helpers'
import Button from 'components/controls/Button/Button'

import moment from 'moment'

import CSSModules from 'react-css-modules'
import styles from './CreateInvoice.scss'
import config from 'app-config'


@connect(({
  user: {
    btcData,
    ethData,
  },
}) => {
  return {
    data: {
      btc: btcData,
      eth: ethData,
    }
  }
})
@injectIntl
@CSSModules(styles, { allowMultiple: true })
export default class CreateInvoice extends PureComponent {

  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    intl: PropTypes.object.isRequired,
  };

  

  constructor() {
    super()
    
    this.timerWaitOnlineJoin = false
    this.state = {
    }
  }

  handleGoHome = () => {
    this.props.history.push(localisedUrl(links.home))
  }

  async componentWillMount() {
    let { match : { params : { type, wallet } }, history, location: { pathname } , data } = this.props

    if (type && wallet && ['btc','eth'].includes(type) && data[type]) {
      const address = data[type].address

      actions.modals.open(constants.modals.InvoiceModal, {
        currency: type.toUpperCase(),
        toAddress: wallet,
        address,
        disableClose: true,
      })
    } else {
      this.props.history.push(localisedUrl(links.notFound))
    }
  }

  async componentWillUnmount() {}

  render() {
    return (
      <div styleName="createInvoice">
        <h2><FormattedMessage id="CreateInvoiceReady" defaultMessage="Спасибо, инвойс выставлен" /></h2>
        <Button brand onClick={this.handleGoHome}>
          <FormattedMessage id="CreateInvoiceGoHome" defaultMessage="Перейти на главную" />
        </Button>
      </div>
    )
  }
}
