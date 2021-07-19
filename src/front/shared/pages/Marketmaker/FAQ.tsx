import React from 'react'
import cssModules from 'react-css-modules'
import { FormattedMessage } from 'react-intl'
import styles from './FAQ.scss'
import { feedback, links } from 'helpers'
import Expandable from 'components/ui/Expandable/Expandable'

import config from 'helpers/externalConfig'

@cssModules(styles, { allowMultiple: true })
class FAQ extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div styleName='mm-faq-page'>
        <section>
          <h2 styleName="section-title">
            <FormattedMessage
              id="MainFAQHeader"
              defaultMessage="FAQ"
            />
          </h2>
          <Expandable
            title={
              <FormattedMessage
                id="MM_FAQ_ItemTitle3"
                defaultMessage="How much will I earn?"
              />
            }
            content={
              <div>
                <FormattedMessage
                  id="MM_FAQ_HowMuchEarn"
                  defaultMessage="We declare from 10% per year (APY). If the number of exchanges is not enough we will motivate users to do exchanges using bounties."
                />
              </div>
            }
            onExpand={() => { feedback.marketmaking.faqOpened('How much will I earn?') }}
          />
          <Expandable
            title={
              <FormattedMessage
                id="MM_FAQ_ItemTitle1"
                defaultMessage="Why does it work?"
              />
            }
            content={
              <FormattedMessage
                id="MM_FAQ_ItemContent1"
                defaultMessage="A market maker earns on the difference in exchange rates when servicing the purchase and sale (spread)"
              />
            }
            onExpand={() => { feedback.marketmaking.faqOpened('Why it works?') }}
          />
          <Expandable
            title={
              <FormattedMessage
                id="MM_FAQ_Safety"
                defaultMessage="Is it safe? Could the balance decrease?"
              />
            }
            content={
              <>
                <div>
                  <FormattedMessage
                    id="MM_FAQ_TotalSum"
                    defaultMessage="- At any given time, the sum of BTC and {token} balances will be greater than before."
                    values={{
                      token: config.binance ? 'BTCB' : 'WBTC'
                    }}
                  />
                </div>
                <div>
                  <FormattedMessage
                    id="MM_FAQ_FundAccess"
                    defaultMessage="- Keys to your funds are only with you, we do not have access to your funds"
                  />
                </div>
                <div>
                  <FormattedMessage
                    id="MM_FAQ_HighRisk"
                    defaultMessage="- Any cryptocurrency operation is high risk."
                  />
                </div>
                <div>
                  <FormattedMessage
                    id="MM_FAQ_Audit"
                    defaultMessage="- The app passed audit from {link}."
                    values={{
                      link: <a href={links.swapAudit} target="_blank">dsec</a>
                    }}
                  />
                </div>
                <div>
                  <FormattedMessage
                    id="MM_FAQ_NotStore"
                    defaultMessage="- Do not store large amounts or borrowed funds."
                  />
                </div>
                <div>
                  {'- '}
                  <a href="https://github.com/swaponline/MultiCurrencyWallet/blob/master/docs/RISKS.md" target="_blank">
                    <FormattedMessage
                      id="MM_FAQ_ItemBody2-5"
                      defaultMessage="Risk Notification"
                    />
                  </a>
                </div>
              </>
            }
            onExpand={() => { feedback.marketmaking.faqOpened('Is it safe?') }}
          />
          <Expandable
            title={
              <FormattedMessage
                id="MM_FAQ_ItemTitle7"
                defaultMessage="Why do I need {token}? I am only interested in earning BTC."
                values={{
                  token: config.binance ? 'BTCB' : 'WBTC',
                }}
              />
            }
            content={
              <>
                <div>
                  <FormattedMessage
                    id="MM_FAQ_ItemContent7-1"
                    defaultMessage="You can replenish only with Bitcoin. But inevitably, at some times, your BTC balance may decrease and {token} may increase, and vice versa."
                    values={{
                      token: config.binance ? 'BTCB' : 'WBTC',
                    }}
                  />
                </div>
                <div>
                  <FormattedMessage
                    id="MM_FAQ_ItemContent7-2"
                    defaultMessage="At any given time, the sum of these balances will be greater than before."
                  />
                </div>
                <div>
                  <FormattedMessage
                    id="MM_FAQ_ItemContent7-3"
                    defaultMessage="If you want to withdraw BTC, but some of them are in {token}, then you will have to change {token} yourself, for example, through Binance exchange."
                    values={{
                      token: config.binance ? 'BTCB' : 'WBTC',
                    }}
                  />
                </div>
              </>
            }
            onExpand={() => { feedback.marketmaking.faqOpened('What is the minimum balance needed to get started?') }}
          />
          <Expandable
            title={
              <FormattedMessage
                id="MM_FAQ_ItemTitle8"
                defaultMessage="Why don't users exchange themselves through Binance exchange?"
              />
            }
            content={
              <FormattedMessage
                id="MM_FAQ_ItemContent8"
                defaultMessage="Our clients love and support decentralization. Our exchange works through smart contracts and we will not be able to freeze the client's funds for more than 3 hours."
              />
            }
            onExpand={() => { feedback.marketmaking.faqOpened('What is the minimum balance needed to get started?') }}
          />
          <Expandable
            title={
              <FormattedMessage
                id="MM_FAQ_ItemTitle4"
                defaultMessage="What is the minimum balance needed to get started?"
              />
            }
            content={
              <FormattedMessage
                id="MM_FAQ_ItemContent4"
                defaultMessage="(in development)"
              />
            }
            onExpand={() => { feedback.marketmaking.faqOpened('What is the minimum balance needed to get started?') }}
          />
          <Expandable
            title={
              <FormattedMessage
                id="MM_FAQ_ItemTitle5"
                defaultMessage="What is the minimum period of market making?"
              />
            }
            content={
              <FormattedMessage
                id="MM_FAQ_ItemContent5"
                defaultMessage="There is no minimum term, you can withdraw funds at any time."
              />
            }
            onExpand={() => { feedback.marketmaking.faqOpened('What is the minimum period of marketmaking?') }}
          />
          <Expandable
            title={
              <FormattedMessage
                id="MM_FAQ_ItemTitle6"
                defaultMessage="How to increase earnings?"
              />
            }
            content={
              <FormattedMessage
                id="MM_FAQ_ItemContent6"
                defaultMessage="Tell the communities where you are a member about the possibility of swap."
              />
            }
            onExpand={() => { feedback.marketmaking.faqOpened('How to increase earnings?') }}
          />
          <Expandable
            title={
              <FormattedMessage
                id="MM_FAQ_ImpermanentLoss"
                defaultMessage="What Impermanent Loss expected?"
              />
            }
            content={
              <FormattedMessage
                id="MM_FAQ_ImpermanentLossContent"
                defaultMessage="At any given time, the sum of these balances will be greater than before. If you want to withdraw BTC, but some of them are in {token}, then you will have to change {token} yourself, for example, through Binance exchange."
                values={{
                  token: config.binance ? 'BTCB' : 'WBTC',
                }}
              />
            }
            onExpand={() => { feedback.marketmaking.faqOpened('What Impermanent Loss expected?') }}
          />
        </section>
      </div>
    )
  }

}

export default FAQ