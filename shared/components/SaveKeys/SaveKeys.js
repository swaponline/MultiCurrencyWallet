import React, { Fragment } from 'react'

import cssModules from 'react-css-modules'
import styles from './SaveKeys.scss'

import Field from './Field/Field'
import Button from 'components/controls/Button/Button'


const SaveKeys = ({ ethData, btcData, isChange, isDownload }) => (
  <Fragment>
    <div styleName="title" >
      These are your private keys. Download the keys by  clicking on <br />
      the button or take
      a screenshot of this page, then confirm it and click here. <br />
      <a href="" onClick={(event) => { event.preventDefault(); isChange() }}>I saved the keys in a safe place</a>
    </div>
    <div styleName="row" >
      <Button brand onClick={isDownload}>Download</Button>
      <div style={{ marginLeft: '15px' }} >
        <Field
          label={ethData.currency}
          privateKey={ethData.privateKey}
        />
        <Field
          label={btcData.currency}
          privateKey={btcData.privateKey}
        />
      </div>
    </div>
  </Fragment>
)

export default cssModules(SaveKeys, styles)

