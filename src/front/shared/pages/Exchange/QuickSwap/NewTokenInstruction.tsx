import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'redaction'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import Toggle from 'components/controls/Toggle/Toggle'

function NewTokenInstruction(props) {
  const { protocols, blockchains } = props
  const [visible, setVisibility] = useState(false)
  const [displayProtocols, setDisplayProtocols] = useState(false)

  const toggleVisibility = () => {
    setVisibility(!visible)
  }

  const toggleProtocolsVisibility = () => {
    setDisplayProtocols(!displayProtocols)
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
              defaultMessage="If you do not see it, possible there is not available pair with your token and you have to create a new pair (liquidity pool)."
            />
          </p>

          <ol>
            <li>
              <FormattedMessage
                id="createNewPoolInAggregates"
                defaultMessage="Chose one of available protocols and create there a new pair with your token (new liquidity pool). This pool has to have liquidity more then 10$ in one of the assets."
              />
            </li>
            <li>
              <FormattedMessage
                id="youWillSeeYourToken"
                defaultMessage="After some time you will be able to see your token in the list."
              />
            </li>
          </ol>

          <div styleName="protocolsToggle">
            <Toggle checked={displayProtocols} onChange={toggleProtocolsVisibility} />
            <FormattedMessage
              id="showAvailableProtocols"
              defaultMessage="Show available protocols"
            />
          </div>

          {/* {displayProtocols &&
            Object.keys(protocols).map((chainId, index) => {
              const { chainName } = blockchains[chainId]

              return (
                <>
                  <p styleName="protocolsChain">
                    <b>{chainName?.replace(/mainnet/i, '')}</b>
                  </p>
                  <ul styleName="protocolsList" key={index}>
                    {protocols[chainId].map((protocol, index) => {
                      return (
                        <li key={index}>
                          <img src={protocol.img} alt={protocol.title} title={protocol.title} />
                        </li>
                      )
                    })}
                  </ul>
                </>
              )
            })} */}
        </div>
      )}
    </section>
  )
}

export default connect(({ oneinch }) => ({
  protocols: oneinch.protocols,
  blockchains: oneinch.blockchains,
}))(CSSModules(NewTokenInstruction, styles, { allowMultiple: true }))
