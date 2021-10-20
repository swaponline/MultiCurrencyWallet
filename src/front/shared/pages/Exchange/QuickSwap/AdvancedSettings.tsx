import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'
import Toggle from 'components/controls/Toggle/Toggle'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import InputRow from './InputRow'

function AdvancedSettings(props) {
  const {
    isAdvancedMode,
    switchAdvancedMode,
    stateReference,
    checkSwapData,
    resetSwapData,
  } = props

  const keyUpHandler = () => {
    setTimeout(checkSwapData, 300)
  }

  const keyDownHandler = (event) => {
    inputReplaceCommaWithDot(event)
    resetSwapData()
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
          <InputRow
            onKeyUp={keyUpHandler}
            onKeyDown={inputReplaceCommaWithDot}
            valueLink={stateReference.slippage}
            styleName="advancedInput"
            labelMessage={
              <FormattedMessage id="slippageTolerance" defaultMessage="Slippage tolerance (%)" />
            }
            labelTooltip={
              <Tooltip id="slippageTooltip">
                <FormattedMessage
                  id="slippageNotice"
                  defaultMessage="If the price changes between the time your order is placed and confirmed it’s called “slippage”. Your swap will automatically cancel if slippage exceeds your “max slippage” setting"
                />
              </Tooltip>
            }
          />

          <InputRow
            onKeyUp={keyUpHandler}
            onKeyDown={keyDownHandler}
            valueLink={stateReference.gasPrice}
            styleName="advancedInput"
            labelMessage={
              <>
                <FormattedMessage id="gasPrice" defaultMessage="Gas price" /> (GWEI)
              </>
            }
            labelTooltip={
              <Tooltip id="gasPriceTooltip">
                <FormattedMessage
                  id="gasPriceNotice"
                  defaultMessage="Gas price specifies the amount of Ether you are willing to pay for each unit of gas"
                />
              </Tooltip>
            }
          />

          <InputRow
            onKeyUp={keyUpHandler}
            onKeyDown={keyDownHandler}
            valueLink={stateReference.gasLimit}
            styleName="advancedInput"
            labelMessage={<FormattedMessage id="gasLimit" defaultMessage="Gas limit" />}
            labelTooltip={
              <Tooltip id="gasLimitTooltip">
                <FormattedMessage
                  id="gasLimitNotice"
                  defaultMessage="Gas limit is the maximum amount of units of gas you are willing to spend"
                />
              </Tooltip>
            }
          />
        </form>
      )}
    </section>
  )
}

export default CSSModules(AdvancedSettings, styles, { allowMultiple: true })
