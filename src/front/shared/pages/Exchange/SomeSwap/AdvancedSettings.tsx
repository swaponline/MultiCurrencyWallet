import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'
import Toggle from 'components/controls/Toggle/Toggle'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'

function AdvancedSettings(props) {
  const { isAdvancedMode, switchAdvancedMode, stateReference } = props

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
          <div styleName="inputWrapper">
            <FieldLabel>
              <FormattedMessage id="gasPrice" defaultMessage="Gas price" />
              <Tooltip id="slippageTooltip">
                <FormattedMessage
                  id="slippageNotice"
                  defaultMessage="Some useful notice for user"
                />
              </Tooltip>
            </FieldLabel>
            <Input
              pattern="0-9\."
              onKeyDown={inputReplaceCommaWithDot}
              valueLink={stateReference.gasPrice}
              withMargin
            />
          </div>

          <div styleName="inputWrapper">
            <FieldLabel>
              <FormattedMessage id="gasLimit" defaultMessage="Gas limit" />
              <Tooltip id="slippageTooltip">
                <FormattedMessage
                  id="slippageNotice"
                  defaultMessage="Some useful notice for user"
                />
              </Tooltip>
            </FieldLabel>
            <Input
              pattern="0-9\."
              onKeyDown={inputReplaceCommaWithDot}
              valueLink={stateReference.gasLimit}
              withMargin
            />
          </div>

          <div styleName="inputWrapper">
            <FieldLabel>
              <FormattedMessage id="destinationRecipient" defaultMessage="Destination recipient" />
              <Tooltip id="slippageTooltip">
                <FormattedMessage
                  id="slippageNotice"
                  defaultMessage="Some useful notice for user"
                />
              </Tooltip>
            </FieldLabel>
            <Input
              pattern="0-9a-zA-Z:"
              onKeyDown={inputReplaceCommaWithDot}
              valueLink={stateReference.destReceiver}
            />
          </div>
        </form>
      )}
    </section>
  )
}

export default CSSModules(AdvancedSettings, styles, { allowMultiple: true })
