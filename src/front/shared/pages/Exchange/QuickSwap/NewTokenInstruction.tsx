import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'redaction'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import Toggle from 'components/controls/Toggle/Toggle'

function NewTokenInstruction(props) {
  const { protocols, blockchains } = props
  const [visible, setVisibility] = useState(false)

  const toggleVisibility = () => {
    setVisibility(!visible)
  }

  return (
    <section styleName="newTokenInstruction">
      <button styleName={`tab ${visible ? 'open' : ''}`} onClick={toggleVisibility}>
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
                defaultMessage="After some time you will be able to see your token in the list."
              />
            </li>
          </ol>
        </div>
      )}
    </section>
  )
}

export default connect(({ oneinch }) => ({
  protocols: oneinch.protocols,
  blockchains: oneinch.blockchains,
}))(CSSModules(NewTokenInstruction, styles, { allowMultiple: true }))
