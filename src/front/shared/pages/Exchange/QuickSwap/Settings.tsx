import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './Settings.scss'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import InputRow from './InputRow'

function Settings(props) {
  const { isSourceMode, stateReference, onInputDataChange, resetSwapData } = props

  const keyUpHandler = () => {
    setTimeout(onInputDataChange, 300)
  }

  const keyDownHandler = (event) => {
    inputReplaceCommaWithDot(event)
    resetSwapData()
  }

  return (
    <section styleName="settings">
      <InputRow
        margin
        onKeyUp={keyUpHandler}
        onKeyDown={inputReplaceCommaWithDot}
        valueLink={stateReference.slippage}
        labelMessage={
          <>
            <FormattedMessage id="slippageTolerance" defaultMessage="Slippage tolerance" />
            {' (%)'}
          </>
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

      {isSourceMode && (
        <InputRow
          margin
          onKeyUp={(event) => this.updateInputValue(event, 'userDeadline')}
          onKeyDown={inputReplaceCommaWithDot}
          valueLink={stateReference.userDeadline}
          labelMessage={
            <FormattedMessage
              id="transactionDeadline"
              defaultMessage="Transaction deadline (minutes)"
            />
          }
        />
      )}

      {!isSourceMode && (
        <>
          <InputRow
            margin
            onKeyUp={keyUpHandler}
            onKeyDown={keyDownHandler}
            valueLink={stateReference.gasPrice}
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
        </>
      )}
    </section>
  )
}

export default CSSModules(Settings, styles, { allowMultiple: true })
