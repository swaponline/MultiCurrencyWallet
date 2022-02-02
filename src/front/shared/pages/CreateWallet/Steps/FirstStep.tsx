import CSSModules from 'react-css-modules'
import { isMobile } from 'react-device-detect'
import { FormattedMessage } from 'react-intl'
import config from 'helpers/externalConfig'
import Coin from 'components/Coin/Coin'
import Button from 'components/controls/Button/Button'
import styles from '../CreateWallet.scss'
import Explanation from '../Explanation'

import Cupture, {
  subHeaderText1,
  subHeaderText2,
  cupture2,
} from './texts'

const isWidgetBuild = config && config.isWidget

function FirstStep(props) {
  const { onClick, error, curState, startPack, handleClick, showPinContent } = props

  return (
    <>
      <>
        <>
          <Explanation step={1} subHeaderText={subHeaderText1()}>
            {!isWidgetBuild && (
              <Cupture />
            )}
          </Explanation>
          <div styleName={`currencyChooserWrapper ${startPack.length < 4 ? 'smallArr' : ''}`}>
            {startPack.map((el, index) => {
              const { name, capture, baseCurrency } = el
              const firstIdPart = `${baseCurrency ? `${baseCurrency}${name}` : `${name}`}`
              const secondIdPart = 'Wallet'
              const selectedCurrency = `${
                baseCurrency ? `{${baseCurrency}}${name}` : `${name}`
              }`.toUpperCase()

              return (
                <div
                  id={firstIdPart.toLowerCase() + secondIdPart}
                  key={index}
                  styleName={`card ${curState[selectedCurrency] ? 'purpleBorder' : ''}`}
                  onClick={() => handleClick(selectedCurrency)}
                >
                  <div styleName="logo">
                    <Coin name={name} styleName="assetsTableIcon" />
                  </div>
                  <ul styleName="currencyInfoList">
                    <li><b>{name}</b></li>
                    <li>
                      {baseCurrency && `(${baseCurrency}) `}
                      {capture}
                    </li>
                  </ul>
                </div>
              )
            })}
          </div>
        </>
        <Button id="continueBtn" styleName="stepButton" disabled={error} onClick={onClick}>
          <FormattedMessage id="createWalletButton1" defaultMessage="Continue" />
        </Button>
      </>
      {
        !isMobile && curState?.BTC && showPinContent
        && (
          <div>
            <Explanation step={2} subHeaderText={subHeaderText2()} notMain>
              {cupture2()}
            </Explanation>
          </div>
        )
      }
    </>
  )
}

export default CSSModules(FirstStep, styles, { allowMultiple: true })
