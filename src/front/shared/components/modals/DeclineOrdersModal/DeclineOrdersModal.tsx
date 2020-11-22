import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'

import { connect } from 'redaction'
import actions from 'redux/actions'
import { localisedUrl } from 'helpers/locale'

import links from 'helpers/links'

import cssModules from 'react-css-modules'
import styles from './DeclineOrdersModal.scss'

import Modal from 'components/modal/Modal/Modal'
import Button from 'components/controls/Button/Button'
import CopyToClipboard from 'react-copy-to-clipboard'

import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'

import { withRouter } from 'react-router-dom'


const title = defineMessages({
  downloadModal: {
    id: 'decline21',
    defaultMessage: 'Declined orders!',
  },
})

@injectIntl
@withRouter
@cssModules(styles)
export default class DeclineOrdersModal extends Component<any, any> {

  goToDecline = () => {
    const { data: { declineSwap: { sellCurrency, buyCurrency, id } }, history } = this.props /* eslint-disable-line */

    const { intl : { locale } } = this.props
    
    history.push(localisedUrl(locale, `${links.swap}/${sellCurrency}-${buyCurrency}/${id}`))
    actions.modals.close('DeclineOrdersModal')
  }

  render() {
    const { intl } = this.props

    return (
      <Modal name="DeclineOrdersModal" title={intl.formatMessage(title.downloadModal)}>
        <div styleName="subTitle">
          <FormattedMessage id="decline43" defaultMessage="Sorry, but you have cannot start until you complete the swaps started earlier " />
        </div>
        <h2 /* eslint-disable-line */ styleName="link" onClick={this.goToDecline}>
          <FormattedMessage id="decline49" defaultMessage="See your incomplete swap" />
        </h2>
      </Modal>
    )
  }
}
