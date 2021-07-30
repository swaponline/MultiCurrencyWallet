import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'
import Toggle from 'components/controls/Toggle/Toggle'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'

function AdvancedSettings(props) {
  const {
    swapData,
    isAdvancedMode,
    switchAdvancedMode,
    stateReference,
    checkSwapData,
    resetSwapData,
  } = props

  const keyDownHandler = (event) => {
    inputReplaceCommaWithDot(event)

    const emptyOptions =
      !stateReference.gasPrice.value &&
      !stateReference.gasLimit.value &&
      !stateReference.destReceiver.value

    if (swapData && emptyOptions) {
      resetSwapData()
    }
  }

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
              onKeyDown={keyDownHandler}
              onKeyUp={checkSwapData}
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
              onKeyDown={keyDownHandler}
              onKeyUp={checkSwapData}
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
              onKeyDown={keyDownHandler}
              onKeyUp={checkSwapData}
              valueLink={stateReference.destReceiver}
            />
          </div>
        </form>
      )}
    </section>
  )
}

export default CSSModules(AdvancedSettings, styles, { allowMultiple: true })
