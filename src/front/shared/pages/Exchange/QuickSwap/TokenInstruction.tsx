import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './TokenInstruction.scss'

function TokenInstruction(props) {
  const [visible, setVisibility] = useState(false)

  const toggleVisibility = () => {
    setVisibility(!visible)
  }

  return (
    <section styleName={`newTokenInstruction ${visible ? 'open' : ''}`}>
      <button styleName="tab" onClick={toggleVisibility}>
        <FormattedMessage id="howToAddToken" defaultMessage="How to add a token" />

        <span styleName="arrow"></span>
      </button>

      {visible && (
        <div styleName="content">
          <ol>
            <li>
              <FormattedMessage
                id="addNewCurrencyMessage"
                defaultMessage="On the wallet page, click the add currency button."
              />
            </li>
            <li>
              <FormattedMessage
                id="choseTokenStandard"
                defaultMessage="Chose a token standard and click the continue button."
              />
            </li>
            <li>
              <FormattedMessage
                id="enterTokenContractAddress"
                defaultMessage="Enter a token contract address."
              />
            </li>
            <li>
              <FormattedMessage
                id="confirmTokenAddition"
                defaultMessage="Check the information and confirm token addition."
              />
            </li>
            <li>
              <FormattedMessage
                id="checkTokenInTheSwapList"
                defaultMessage="Now you can see you token in the list."
              />
            </li>
          </ol>

          <p styleName="paragraph">
            <FormattedMessage
              id="ifYouDoNotSeeNewToken"
              defaultMessage="You will not be able to exchange some tokens, because there may not be an available liquidity pool with your token. You have to create a new one if you want to exchange it."
            />
          </p>

          <ol>
            <li>
              <FormattedMessage
                id="createNewPoolInAggregates"
                defaultMessage="Chose one of supported sources and create there a new pool with your token."
              />
            </li>
            <li>
              <FormattedMessage
                id="youWillSeeYourToken"
                defaultMessage="After determining a liquidity pool with your token, it will be available for exchange."
              />
            </li>
          </ol>

          <a
            styleName="liquiditySourcesLink"
            href="https://github.com/swaponline/MultiCurrencyWallet/blob/master/docs/LIQUIDITY_SOURCES.md"
            target="_blank"
          >
            <FormattedMessage id="detailedInformation" defaultMessage="Detailed information" />
          </a>
        </div>
      )}
    </section>
  )
}

export default CSSModules(TokenInstruction, styles, { allowMultiple: true })
