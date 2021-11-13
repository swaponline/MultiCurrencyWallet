import { useState, useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import commonStyles from './index.scss'
import styles from './Settings.scss'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { SOURCE_MODE_SLIPPAGE } from './constants'
import InputRow from './InputRow'

function Settings(props) {
  const { isSourceMode, stateReference, onInputDataChange, resetSwapData, slippage } = props

  const keyUpHandler = () => {
    setTimeout(onInputDataChange, 300)
  }

  const keyDownHandler = (event) => {
    inputReplaceCommaWithDot(event)
    resetSwapData()
  }

  const [lowSlippage, setLowSlippage] = useState<boolean>(false)
  const [frontrunSlippageRange, setFrontrunRange] = useState<boolean>(false)
  const [maxSlippageRange, setMaxSlippageRange] = useState<boolean>(false)

  useEffect(() => {
    setLowSlippage(slippage < SOURCE_MODE_SLIPPAGE.FAIL)
    setFrontrunRange(
      slippage > SOURCE_MODE_SLIPPAGE.FRONTRUN && slippage < SOURCE_MODE_SLIPPAGE.MAX
    )
    setMaxSlippageRange(slippage >= SOURCE_MODE_SLIPPAGE.MAX)
  }, [slippage])

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
              defaultMessage="Your transaction will revert if the price changes unfavorably by more than this percentage"
            />
          </Tooltip>
        }
      />

      {isSourceMode && (
        <InputRow
          margin
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

      <InputRow
        margin
        disabled={isSourceMode}
        placeholder="auto"
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
        disabled={isSourceMode}
        placeholder="auto"
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

      <div styleName="messagesWrapper">
        {lowSlippage ? (
          <p styleName="warningNotice">
            <FormattedMessage id="transactionMayFail" defaultMessage="Transaction may fail" />
          </p>
        ) : frontrunSlippageRange ? (
          <p styleName="warningNotice">
            <FormattedMessage
              id="transactionMayBeFrontrun"
              defaultMessage="Transaction may be frontrun"
            />
          </p>
        ) : maxSlippageRange ? (
          <p styleName="dangerousNotice">
            <FormattedMessage
              id="invalidSlippagePercent"
              defaultMessage="Invalid slippage percent"
            />
          </p>
        ) : null}
      </div>
    </section>
  )
}

export default CSSModules(Settings, { ...styles, ...commonStyles }, { allowMultiple: true })
