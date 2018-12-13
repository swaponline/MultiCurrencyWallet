import React, { Component } from 'react'

import { Link } from 'react-router-dom'

import actions from 'redux/actions'
import { links } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './EthChecker.scss'

import { Modal } from 'components/modal'
import { Button } from 'components/controls'
import { FormattedMessage, injectIntl } from 'react-intl'
import { localisedUrl } from 'helpers/locale'


const title = [
  <FormattedMessage id="Approve" defaultMessage="Approve token" />,
]


@injectIntl
@CSSModules(styles)
export default class EthChecker extends Component {
  render() {

    const { name, intl: { locale }  } = this.props

    return (
      <Modal name={name} title={title}>
        <div styleName="content">
          <FormattedMessage id="EthChecker19" defaultMessage="This token works on Ethereum blockchain. To swap this token you must have at least 0.02 ETH on your balance">
            {message => <p>{message}</p>}
          </FormattedMessage>
          <Link to={localisedUrl(locale, links.home)}>
            <Button styleName="button" brand fullWidth onClick={() => actions.modals.close(name)}>
              <FormattedMessage id="EthChecker23" defaultMessage="Go wallet" />
            </Button>
          </Link>
        </div>
      </Modal>
    )
  }
}
