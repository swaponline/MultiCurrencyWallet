import React, { Component } from 'react'
import { connect } from 'redaction'
import CSSModules from 'react-css-modules'
import styles from './SaveKeys.scss'

import Field from './Field/Field'
import Button from 'components/controls/Button/Button'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage } from 'react-intl'

type SaveKeysProps = {
  onChange: () => void
  onDownload: () => void
  // from store
  ethData?: IUniversalObj
  btcData?: IUniversalObj
  ghostData?: IUniversalObj
  nextData?: IUniversalObj
}

@connect(({ user: { ethData, btcData, ghostData, nextData } }) => ({ btcData, ethData, ghostData, nextData }))
@CSSModules(styles)
export default class SaveKeys extends Component<SaveKeysProps, null> {
  render() {
    const {
      ethData,
      btcData,
      ghostData,
      nextData,
      onChange,
      onDownload,
      ...otherProps
    } = this.props

    return (
      <div {...otherProps}>
        <div styleName="title" >
          <FormattedMessage
            id="SaveKeys235"
            defaultMessage={`These are your private keys. Download the keys by clicking on the button or take a screenshot of this page, then confirm it and click here.`}
          />
        </div>

        <div styleName="linked" onClick={onChange}>
          <FormattedMessage id="SaveKeys26" defaultMessage="I saved the keys in a safe place" />
        </div>

        <div styleName="row" >
          <div styleName="cell" >
            <Field
              label={ethData.currency}
              privateKey={ethData.privateKey}
            />
            <Field
              label={btcData.currency}
              privateKey={btcData.privateKey}
            />
            <Field
              label={ghostData.currency}
              privateKey={ghostData.privateKey}
            />
            <Field
              label={nextData.currency}
              privateKey={nextData.privateKey}
            />
          </div>
          
          <Button brand onClick={onDownload} id="SaveKeysDownload">
            <FormattedMessage id="SaveKe33" defaultMessage="Download" />
          </Button>
          <Tooltip id="SaveKeysDownload" mark={false} place="bottom">
            <FormattedMessage id="SaveKe37" defaultMessage="Download text document with keys and accounts" />
          </Tooltip>
        </div>
      </div>
    )
  }
}
