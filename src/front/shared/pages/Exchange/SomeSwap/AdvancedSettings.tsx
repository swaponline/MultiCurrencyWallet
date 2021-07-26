import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import Toggle from 'components/controls/Toggle/Toggle'
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
    <section styleName="advancedSettings">
      <div styleName="toggleWrapper">
        <Toggle checked={isAdvancedMode} onChange={switchAdvancedMode} />
        <p styleName="name">
          <FormattedMessage id="advancedSettings" defaultMessage="Advanced settings" />
        </p>
      </div>

      {isAdvancedMode && (
        <form styleName="settings" action="">
          Extra swap options
        </form>
      )}
    </section>
  )
}

export default CSSModules(AdvancedSettings, styles, { allowMultiple: true })
