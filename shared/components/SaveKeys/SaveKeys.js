import React, { Fragment, Component } from 'react'
import { connect } from 'redaction'

import CSSModules from 'react-css-modules'
import styles from './SaveKeys.scss'

import Field from './Field/Field'
import Button from 'components/controls/Button/Button'


@connect(({ user: { ethData, btcData, eosData } }) => ({
  btcData, ethData, eosData,
}))
@CSSModules(styles)
export default class SaveKeys extends Component {
  render() {
    const { ethData, btcData, eosData, isChange, isDownload, ...otherProps } = this.props

    return (
      <div {...otherProps}>
        <div styleName="title" >
          These are your private keys. Download the keys by  clicking on <br />
          the button or take a screenshot of this page, then confirm it and click here. <br />
          <span styleName="linked" onClick={isChange}>I saved the keys in a safe place</span>
        </div>
        <div styleName="row" >
          <Button brand onClick={isDownload}>Download</Button>
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
          </div>
        </div>
      </div>
    )
  }
}
