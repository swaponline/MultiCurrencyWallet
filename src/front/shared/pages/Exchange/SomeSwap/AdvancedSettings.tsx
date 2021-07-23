import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { AdvancedOptions } from './types'

/* 
  AdvancedOptions:

  protocols: any
  destReceiver: any
  referrerAddress: any
  fee: any
  gasPrice: any
  burnChi: any
  complexityLevel: any
  connectorTokens: any
  allowPartialFill: any
  disableEstimate: any
  gasLimit: any
  parts: any
  mainRouteParts: any
*/

function AdvancedSettings(props) {
  const { isAdvancedMode, switchAdvancedMode } = props

  return (
    <section styleName="advancedOptions">
      <div styleName="advancedOptionsToggle">
        <input id="advancedModeCheckbox" type="checkbox" onChange={switchAdvancedMode} />
        <label htmlFor="advancedModeCheckbox">
          <FormattedMessage id="advancedOptions" defaultMessage="Advanced options" />
        </label>
      </div>

      {isAdvancedMode && <form action="">Extra swap options</form>}
    </section>
  )
}

export default CSSModules(AdvancedSettings, styles, { allowMultiple: true })