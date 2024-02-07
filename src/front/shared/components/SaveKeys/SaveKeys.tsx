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
  data: IUniversalObj
}

@connect(({
  user: {
    ethData,
    bnbData,
    maticData,
    arbethData,
    aurethData,
    xdaiData,
    ftmData,
    avaxData,
    movrData,
    oneData,
    phi_v1Data,
    phiData,
    fkwData,
    phpxData,
    ameData,
    btcData,
    ghostData,
    nextData,
  }
}) => ({
  data: [
    btcData,
    bnbData,
    maticData,
    arbethData,
    aurethData,
    xdaiData,
    ftmData,
    avaxData,
    movrData,
    oneData,
    phi_v1Data,
    phiData,
    fkwData,
    phpxData,
    ameData,
    ethData,
    ghostData,
    nextData,
  ]
}))
@CSSModules(styles)
export default class SaveKeys extends Component<SaveKeysProps, null> {
  render() {
    const {
      data,
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
            {data.map((currencyData, index) => {
              return (
                <Field
                  key={index}
                  label={currencyData.currency}
                  privateKey={currencyData.privateKey}
                />
              )
            })}
          </div>
          
          <Button brand onClick={onDownload} id="SaveKeysDownload">
            <FormattedMessage id="SaveKe33" defaultMessage="Download" />
          </Button>
          {/* @ts-ignore: strictNullChecks */}
          <Tooltip id="SaveKeysDownload" mark={false} place="bottom">
            <FormattedMessage id="SaveKe37" defaultMessage="Download text document with keys and accounts" />
          </Tooltip>
        </div>
      </div>
    )
  }
}
