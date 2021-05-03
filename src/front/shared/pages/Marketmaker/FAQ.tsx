import React from 'react'
import cssModules from 'react-css-modules'
import { FormattedMessage } from 'react-intl'
import styles from './FAQ.scss'
import { feedback } from 'helpers'
import Expandable from 'components/ui/Expandable/Expandable'


@cssModules(styles, { allowMultiple: true })
class FAQ extends React.Component<{isDark: boolean}, {}> {
  constructor(props) {
    super(props)
  }

  render() {
    const { isDark } = this.props

    return (
      <div styleName='mm-faq-page'>
        <section styleName={`${isDark ? 'dark' : '' }`}>
          <h2 styleName="section-title">
            <FormattedMessage
              id="MainFAQHeader"
              defaultMessage="FAQ"
            />
          </h2>
          <Expandable
            title={
              <FormattedMessage
                id="MM_FAQ_ItemTitle1"
                defaultMessage="Why it works?"
              />
            }
            content={
              <FormattedMessage
                id="MM_FAQ_ItemContent1"
                defaultMessage="The market maker earns on the difference in exchange rates when servicing the purchase and sale (spread)"
              />
            }
            onExpand={() => { feedback.marketmaking.faqOpened('Why it works?') }}
          />
          <Expandable
            title={
              <FormattedMessage
                id="MM_FAQ_ItemTitle2"
                defaultMessage="Is it safe?"
              />
            }
            content={
              <>
                <div>
                  <FormattedMessage
                    id="MM_FAQ_ItemBody2-1"
                    defaultMessage="- The system is in beta"
                  />
                </div>
                <div>
                  <FormattedMessage
                    id="MM_FAQ_ItemBody2-2"
                    defaultMessage="- There is an audit from dsec"
                  />
                </div>
                <div>
                  <FormattedMessage
                    id="MM_FAQ_ItemBody2-3"
                    defaultMessage="- We recommend investing only those funds that you do not mind losing"
                  />
                </div>
                <div>
                  <FormattedMessage
                    id="MM_FAQ_ItemBody2-4"
                    defaultMessage="- The keys to your funds are only with you, we do not have access to your funds"
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
                id="MM_FAQ_ItemTitle3"
                defaultMessage="How much will I earn?"
              />
            }
            content={
              <div>
                <FormattedMessage
                  id="MM_FAQ_ItemContent3-1"
                  defaultMessage="It depends on the number of swaps and the spread. But if there are no swaps, you will get SWAP tokens at the rate of 10% APY. To get it, write to "
                />
                <a href="https://t.me/swaponlinebot" target="_blank">
                  <FormattedMessage
                    id="MM_FAQ_ItemContent3-2"
                    defaultMessage="support."
                  />
                </a>
              </div>
            }
            onExpand={() => { feedback.marketmaking.faqOpened('How much will I earn?') }}
          />
          <Expandable
            title={
              <FormattedMessage
                id="MM_FAQ_ItemTitle7"
                defaultMessage="Why do I need WBTC? I am only interested in earning BTC."
              />
            }
            content={
              <>
                <div>
                  <FormattedMessage
                    id="MM_FAQ_ItemContent7-1"
                    defaultMessage="You can replenish only with Bitcoin, but inevitably, at some periods, your BTC balance may decrease, and WBTC may increase, and vice versa."
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
                    defaultMessage="If you want to withdraw BTC, but some of them are in WBTC, then you will have to change WBTC yourself, for example, through the Binance exchange."
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
                defaultMessage="Why don't users exchange themselves through the Binance exchange?"
              />
            }
            content={
              <FormattedMessage
                id="MM_FAQ_ItemContent8"
                defaultMessage="Our clients love and support decentralization, our exchanger works through smart contracts and we will not be able to freeze the client's funds for more than 3 hours."
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
                defaultMessage="What is the minimum period of marketmaking?"
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
                defaultMessage="Tell about the possibility of swap in the communities where you are a member."
              />
            }
            onExpand={() => { feedback.marketmaking.faqOpened('How to increase earnings?') }}
          />
        </section>
      </div>
    )
  }

}

export default FAQ