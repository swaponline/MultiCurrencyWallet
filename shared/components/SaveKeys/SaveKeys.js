import React, { Fragment, Component } from 'react'
import { connect } from 'redaction'

import CSSModules from 'react-css-modules'
import styles from './SaveKeys.scss'

import Field from './Field/Field'
import Button from 'components/controls/Button/Button'
import ReactTooltip from 'react-tooltip'
import { FormattedMessage } from 'react-intl'


@connect(({ user: { ethData, btcData, eosData, telosData } }) => ({
  btcData, ethData, eosData, telosData,
}))
@CSSModules(styles)
export default class SaveKeys extends Component {
  render() {
    const { ethData, btcData, eosData, telosData, isChange, isDownload, ...otherProps } = this.props

    return (
      <div {...otherProps}>
        <div styleName="title" >
          <FormattedMessage id="SaveKeys23" defaultMessage="These are your private keys. Download the keys by  clicking on " />
          <FormattedMessage id="SaveKeys24" defaultMessage="the button or take a screenshot of this page, then confirm it and click here." />
          <span styleName="linked" onClick={isChange}>
            <FormattedMessage id="SaveKeys26" defaultMessage="I saved the keys in a safe place" />
            <br />
          </span>
        </div>
        <div styleName="row" >
          <Button brand onClick={isDownload} data-tip data-for="Download">
            <FormattedMessage id="SaveKe33" defaultMessage="Download" />
          </Button>
          <ReactTooltip id="Download" type="light" effect="solid">
            <span>
              <FormattedMessage id="SaveKe37" defaultMessage="Download text document with keys and accounts" />
            </span>
          </ReactTooltip>
          <div styleName="cell" >
          <Field
          label={ethData.currency}
          privateKey={ethData.privateKey.toString()}
          />
          <Field
            label={btcData.currency}
            privateKey={btcData.privateKey.toString()}
          />
          { typeof eosData.masterPrivateKey === 'string' &&
            <Field
              label={eosData.currency}
              privateKey={eosData.masterPrivateKey.toString()}
            />
          }
          { typeof telosData.activePrivateKey === 'string' &&
          <Field
            label={telosData.currency}
            privateKey={telosData.activePrivateKey.toString()}
            />
          }
          </div>
        </div>
      </div>
    )
  }
}
