import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'

function NewTokenInstruction() {
  const [visible, setVisibility] = useState(false)

  const toggleVisibility = () => {
    setVisibility(!visible)
  }

  return (
    <section styleName="newTokenInstruction">
      <button styleName="tab" onClick={toggleVisibility}>
        
        <FormattedMessage id="howToAddToken" defaultMessage="How to add a token" />

        <span styleName={`arrow ${visible ? 'open' : ''}`}></span>
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

          <p>
            <FormattedMessage
              id="ifYouDoNotSeeNewToken"
              defaultMessage="If you do not see it, possible there is not available pair with your token and you have to create a new pair (liquidity pool)."
            />
          </p>

          <ol>
            <li>
              <FormattedMessage
                id="createNewPoolInAggregates"
                defaultMessage="Chose one of available aggregates and create there a new pair with your token (new liquidity pool). This pool has to have liquidity more then 10$ in one of the assets."
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

export default CSSModules(NewTokenInstruction, styles, { allowMultiple: true })
