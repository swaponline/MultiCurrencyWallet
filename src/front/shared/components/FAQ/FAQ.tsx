import React, { useState, useEffect } from 'react'
import BigNumber from 'bignumber.js'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import btcUtils from 'common/utils/coin/btc'
import { FormattedMessage, injectIntl } from 'react-intl'
import { constants, feedback, adminFee, eth, bnb, externalConfig } from 'helpers'
import cssModules from 'react-css-modules'
import cx from 'classnames'
import styles from './styles.scss'

const NETWORK = process.env.MAINNET
  ? 'MAINNET'
  : 'TESTNET'

const tabsIdsDictionary = {
  FIRST_TAB: 'MainFAQ1_header',
  SECOND_TAB: 'MainFAQ2_header',
  THIRD_TAB: 'MainFAQ3_header',
}

const FAQ = (props) => {
  const [btcFee, setBtcFee] = useState(null)
  const [ethFee, setEthFee] = useState(null)
  const [bnbFee, setBnbFee] = useState(null)

  useEffect(() => {
    let _mounted = true
    let btcSatoshiPrice = null
    let ethGasPrice = null
    let bnbGasPrice = null

    async function fetchFees() {
      try {
        const BYTE_IN_KB = 1024

        btcSatoshiPrice = await btcUtils.estimateFeeRate({ speed: 'fast', NETWORK })

        externalConfig.binance
          ? bnbGasPrice = await bnb.estimateGasPrice()
          : ethGasPrice = await eth.estimateGasPrice({ speed: 'fast' })

        // remove memory leak
        if (_mounted) {
          // divided by 1 kb to convert it to satoshi / byte
          setBtcFee(Math.ceil(btcSatoshiPrice / BYTE_IN_KB))

          externalConfig.binance
            ? setBnbFee(bnbGasPrice)
            // return gas * 1e9 - divided by 1e9 to convert
            : setEthFee(new BigNumber(ethGasPrice).dividedBy(1e9).toNumber())
        }
      } catch (error) {
        console.error('FAQ -> useEffect: ', error)
        feedback.faq.failed(`fetch fees error(${error.message})`)
      }
    }

    fetchFees()
    return () => {
      _mounted = false
    }
  })

  const { intl: { formatMessage } } = props
  const [openedTabs, setOpenedTabs] = useState({
    FIRST_TAB: false,
    SECOND_TAB: false,
    THIRD_TAB: false,
  })
  const [openedTabsCounter, setOpenedTabsCounter] = useState({
    FIRST_TAB: 0,
    SECOND_TAB: 0,
    THIRD_TAB: 0,
  })


  const isDark = localStorage.getItem(constants.localStorage.isDark)

  const handleTabClick = (tabName) => {
    setOpenedTabs({ ...openedTabs, [tabName]: !openedTabs[tabName] })
    if (openedTabsCounter[tabName] === 0) {
      feedback.faq.opened(formatMessage({ id: tabsIdsDictionary[tabName] }))
    }
    setOpenedTabsCounter({ ...openedTabsCounter, [tabName]: ++openedTabsCounter[tabName] })
  }

  const BtcPrecentFee = adminFee.isEnabled('BTC')
  const EthPrecentFee = adminFee.isEnabled('ETH')
  const BnbPrecentFee = adminFee.isEnabled('BNB')

  return (
    <div className={`${styles.faQuestions} ${isDark ? styles.dark : ''}`}>
      <h5 className={styles.faQuestions__header}>
        <FormattedMessage id="MainFAQHeader" defaultMessage="FAQ" />
      </h5>
      <div className={styles.faQuestions__tabsContainer}>
        <article className={styles.tab}>
          <h6 className={styles.tab__header} onClick={() => handleTabClick('FIRST_TAB')}>
            <div className={cx({
              [styles.chrest]: true,
              [styles.chrest_active]: openedTabs.FIRST_TAB,
            })} />
            <FormattedMessage id="MainFAQ1_header" defaultMessage="How are my private keys stored?" />
          </h6>
          <div className={cx({
            [styles.tab__content]: true,
            [styles.tab__content_active]: openedTabs.FIRST_TAB,
          })}>
            <FormattedMessage id="MainFAQ1_content" defaultMessage="Your private keys are stored ONLY on your device, in the localStorage of your browser. Please backup your keys, because your browser or device may be crashed." />
          </div>
        </article>
        <article className={styles.tab}>
          <h6 className={styles.tab__header} onClick={() => handleTabClick('SECOND_TAB')}>
            <div className={cx({
              [styles.chrest]: true,
              [styles.chrest_active]: openedTabs.SECOND_TAB,
            })} />
            <FormattedMessage id="MainFAQ2_header" defaultMessage="What are the fees involved?" />
          </h6>
          <div className={cx({
            [styles.tab__content]: true,
            [styles.tab__content_active]: openedTabs.SECOND_TAB,
          })}>
            <p>
              <FormattedMessage id="MainFAQ2_content" defaultMessage="You pay the standard TX (miners fees) for all transactions you conduct on the platform." />
            </p>
            <p>
              <FormattedMessage id="MainFAQ2_content1" defaultMessage="For ERC20 tokens, it is required that you have at least 0.001 ETH on your wallets. Remember! when sending ERC20 tokens, you are required to hold some ETH as miners fees for transactions. This is also the case for all atomic swaps for ETH & ERC20 tokens." />
            </p>
            <p>
              <FormattedMessage id="MainFAQ2_content2" defaultMessage="NOTE: You can easily check the ‘miners fees’ required for each respective coin by simply googling them." />
            </p>
            <FormattedMessage id="MainFAQ2_content3" defaultMessage="Current mining fees:" />
            <div className={styles.descriptionFee}>
              <span>BTC:</span>{' '}
              {btcFee
                ? (
                  <span>
                    <b>{btcFee}</b> sat/byte
                    {' '}
                    <a className={styles.link} href={externalConfig.api.blockcypher} target="_blank">
                      <FormattedMessage id="FAQFeeApiLink" defaultMessage="(source)" />
                    </a>
                  </span>
                ) : <InlineLoader />
              }
            </div>
            <div className={styles.descriptionFee}>
              {externalConfig.binance ? (
                <>
                  <span>BNB:</span>{' '}
                  {bnbFee
                    ? (
                      <span>
                        <b>{bnbFee}</b> gwei
                        {' '}
                        {/* TODO: replace api source gas link BNB */}
                        <a className={styles.link} href={externalConfig.api.defipulse} target="_blank">
                          <FormattedMessage id="FAQFeeApiLink" defaultMessage="(source)" />
                        </a>
                      </span>
                    ) : <InlineLoader />
                  }
                </>
              ) : (
                <>
                  <span>ETH:</span>{' '}
                  {ethFee
                    ? (
                      <span>
                        <b>{ethFee}</b> gwei
                        {' '}
                        <a className={styles.link} href={externalConfig.api.defipulse} target="_blank">
                          <FormattedMessage id="FAQFeeApiLink" defaultMessage="(source)" />
                        </a>
                      </span>
                    ) : <InlineLoader />
                  }
                </>
              )}
            </div>
            <br />
            <FormattedMessage id="FAQServiceFee" defaultMessage="Service fee (only withdraw):" />
            <p className={styles.descriptionFee}>
              <span>BTC:</span>{' '}
              {BtcPrecentFee
                ? (
                  <span>
                    {BtcPrecentFee.fee + '%, '}
                    <FormattedMessage id="FAQServiceFeeDescription" defaultMessage="no less than" />
                    {' '}<b>{adminFee.calc('BTC', null)}</b> BTC
                  </span>
                )
                : <span>0%</span>
              }
            </p>

            {externalConfig.binance ? (
              <p className={styles.descriptionFee}>
                <span>BNB:</span>{' '}
                {BnbPrecentFee
                  ? (
                    <span>
                      {BnbPrecentFee.fee + '%, '}
                      <FormattedMessage id="FAQServiceFeeDescription" defaultMessage="no less than" />
                      {' '}<b>{adminFee.calc('BNB', null)}</b> BNB
                    </span>
                  )
                  : <span>0%</span>
                }
              </p>
            ) : (
              <p className={styles.descriptionFee}>
                <span>ETH:</span>{' '}
                {EthPrecentFee
                    ? (
                      <span>
                        {EthPrecentFee.fee + '%, '}
                        <FormattedMessage id="FAQServiceFeeDescription" defaultMessage="no less than" />
                        {' '}<b>{adminFee.calc('ETH', null)}</b> ETH
                      </span>
                    )
                    : <span>0%</span>
                }
              </p>
            )}
          </div>
        </article>
        <article className={styles.tab}>
          <h6 className={styles.tab__header} onClick={() => handleTabClick('THIRD_TAB')}>
            <div className={cx({
              [styles.chrest]: true,
              [styles.chrest_active]: openedTabs.THIRD_TAB,
            })} />
            <FormattedMessage id="MainFAQ3_header" defaultMessage="Why mining fee is too high?" />
          </h6>
          <div className={cx({
            [styles.tab__content]: true,
            [styles.tab__content_active]: openedTabs.THIRD_TAB,
          })}>
            <p>
              <FormattedMessage id="MainFAQ3_content" defaultMessage="Blockchain fees depend on several factors including network congestion and transaction size (affected when converting crypto from multiple inputs such as faucet earnings or other micro-transactions)." />
            </p>
            <p>
              <FormattedMessage id="MainFAQ3_content1" defaultMessage="In other words, you may need to pay higher blockchain fees if:" />
            </p>
            <p>
              <FormattedMessage id="MainFAQ3_content2" defaultMessage="1) The blockchain network is busy or loaded at the moment. Usually, the fee increases during sudden blockchain rate fluctuations and major world events;" />
              <br/>
              <FormattedMessage id="MainFAQ3_content3" defaultMessage="2) Your crypto account has a history of microdeposits. If your account has large amounts of small deposits, the size of your transaction will be bigger as it will consist of many inputs. The bigger the transaction size, the higher the blockchain fee." />
            </p>
            <p>
              <FormattedMessage id="MainFAQ3_content4" defaultMessage="There might be other causes of higher blockchain fees, but we've listed the most common ones." />
            </p>
          </div>
        </article>
      </div>
    </div>
  )
}

export default React.memo(cssModules(injectIntl(FAQ), styles, { allowMultiple: true }))