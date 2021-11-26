import React, { useState, useEffect } from 'react'
import BigNumber from 'bignumber.js'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import btcUtils from 'common/utils/coin/btc'
import ethLikeHelper from 'common/helpers/ethLikeHelper'
import { FormattedMessage, injectIntl } from 'react-intl'
import { feedback, adminFee, externalConfig } from 'helpers'
import cssModules from 'react-css-modules'
import cx from 'classnames'
import styles from './styles.scss'
import config from 'helpers/externalConfig'


const disableInternalWallet = config.opts.ui.disableInternalWallet

const NETWORK = process.env.MAINNET
  ? 'MAINNET'
  : 'TESTNET'

const tabsIdsDictionary = {
  FIRST_TAB: 'MainFAQ1_header',
  SECOND_TAB: 'MainFAQ2_header',
  THIRD_TAB: 'MainFAQ3_header',
}

const FAQ = (props) => {
  const { intl: { formatMessage } } = props
  const [tabsVisibility, setTabsVisibility] = useState({
    FIRST_TAB: false,
    SECOND_TAB: false,
    THIRD_TAB: false,
  })
  const [openedTabs, setOpenedTabs] = useState({
    FIRST_TAB: false,
    SECOND_TAB: false,
    THIRD_TAB: false,
  })

  const handleTabClick = (tabName) => {
    setTabsVisibility({ ...tabsVisibility, [tabName]: !tabsVisibility[tabName] })

    if (!openedTabs[tabName]) {
      feedback.faq.opened(formatMessage({ id: tabsIdsDictionary[tabName] }))
      setOpenedTabs({ ...openedTabs, [tabName]: true })
    }
  }

  const convertToGwei = (value) => {
    return new BigNumber(value)
      .dividedBy(1e9)
      .dp(2, BigNumber.ROUND_HALF_CEIL)
      .toNumber()
  }

  const [fees, setFees] = useState({
    btc: 0,
    eth: 0,
    bnb: 0,
    matic: 0,
    arbeth: 0,
  })

  useEffect(() => {
    let _mounted = true

    async function fetchFees() {
      try {
        const BYTE_IN_KB = 1024

        const btcSatoshiPrice = await btcUtils.estimateFeeRate({ speed: 'fast', NETWORK })
        const bnbGasPrice = await ethLikeHelper.bnb.estimateGasPrice()
        const ethGasPrice = await ethLikeHelper.eth.estimateGasPrice()
        const maticGasPrice = await ethLikeHelper.matic.estimateGasPrice()
        const arbethGasPrice = await ethLikeHelper.arbeth.estimateGasPrice()

        // remove memory leak
        if (_mounted) {
          setFees((prevFees) => ({
            ...prevFees,
            // divided by 1 kb to convert it to satoshi / byte
            btc: Math.ceil(btcSatoshiPrice / BYTE_IN_KB),
            eth: convertToGwei(bnbGasPrice),
            bnb: convertToGwei(ethGasPrice),
            matic: convertToGwei(maticGasPrice),
            arbeth: convertToGwei(arbethGasPrice),
          }))
        }
      } catch (error) {
        feedback.faq.failed(`FAQ. Fetch fees error(${error.message})`)
      }
    }

    if (tabsVisibility.SECOND_TAB) {
      fetchFees()
    }

    return () => {
      _mounted = false
    }
  }, [tabsVisibility.SECOND_TAB])

  const miningFeeItems = [
    {
      ticker: 'BTC',
      fee: fees.btc,
      unit: 'sat/byte',
      sourceLink: externalConfig.api.blockcypher,
    },
    {
      ticker: 'ETH',
      fee: fees.eth,
      unit: 'gwei',
    },
    {
      ticker: 'BNB',
      fee: fees.bnb,
      unit: 'gwei',
    },
    {
      ticker: 'MATIC',
      fee: fees.matic,
      unit: 'gwei',
    },
    {
      ticker: 'ARBETH',
      fee: fees.arbeth,
      unit: 'gwei',
    },
  ]

  const adminFeeItems = [
    {
      ticker: 'BTC',
      percentFee: adminFee.isEnabled('BTC'),
    },
    {
      ticker: 'ETH',
      percentFee: adminFee.isEnabled('ETH'),
    },
    {
      ticker: 'BNB',
      percentFee: adminFee.isEnabled('BNB'),
    },
    {
      ticker: 'MATIC',
      percentFee: adminFee.isEnabled('MATIC'),
    },
    {
      ticker: 'ARBETH',
      percentFee: adminFee.isEnabled('ARBETH'),
    },
  ]

  return (
    <div className={`${styles.faQuestions}`}>
      <h5 className={styles.faQuestions__header}>
        <FormattedMessage id="MainFAQHeader" defaultMessage="FAQ" />
      </h5>
      <div className={styles.faQuestions__tabsContainer}>
        {!disableInternalWallet && (
          <article className={styles.tab}>
            <h6 className={styles.tab__header} onClick={() => handleTabClick('FIRST_TAB')}>
              <div className={cx({
                [styles.chrest]: true,
                [styles.chrest_active]: tabsVisibility.FIRST_TAB,
              })} />
              <FormattedMessage id="MainFAQ1_header" defaultMessage="How are my private keys stored?" />
            </h6>
            <div className={cx({
              [styles.tab__content]: true,
              [styles.tab__content_active]: tabsVisibility.FIRST_TAB,
            })}>
              <FormattedMessage id="MainFAQ1_content" defaultMessage="Your private keys are stored ONLY on your device, in the localStorage of your browser. Please backup your keys, because your browser or device may be crashed." />
            </div>
          </article>
        )}

        <article className={styles.tab}>
          <h6 className={styles.tab__header} onClick={() => handleTabClick('SECOND_TAB')}>
            <div className={cx({
              [styles.chrest]: true,
              [styles.chrest_active]: tabsVisibility.SECOND_TAB,
            })} />
            <FormattedMessage id="MainFAQ2_header" defaultMessage="What are the fees involved?" />
          </h6>
          <div className={cx({
            [styles.tab__content]: true,
            [styles.tab__content_active]: tabsVisibility.SECOND_TAB,
          })}>
            <p>
              <FormattedMessage id="MainFAQ2_content" defaultMessage="You pay the standard TX (miners fees) for all transactions you conduct on the platform." />
            </p>
            <p>
              <FormattedMessage
                id="MainFAQ2_content1"
                defaultMessage="For {tokenType} tokens, it is required that you have at least 0.001 {currency} on your wallets. Remember! when sending {tokenType} tokens, you are required to hold some {currency} as miners fees for transactions. This is also the case for all atomic swaps for {currency} & {tokenType} tokens."
                values={{
                  currency: 'ETH',
                  tokenType: 'ERC20'
                }}
              />
            </p>
            <p>
              <FormattedMessage id="MainFAQ2_content2" defaultMessage="NOTE: You can easily check the ‘miners fees’ required for each respective coin by simply googling them." />
            </p>

            <p className={styles.feeInfoTitle}>
              <FormattedMessage id="MainFAQ2_content3" defaultMessage="Current mining fees:" />
            </p>

            {miningFeeItems.map((item, index) => {
              const { ticker, fee, unit, sourceLink } = item

              return (
                <div className={styles.descriptionFee} key={index}>
                  <span>{ticker}:</span>{' '}
                  {fee ? (
                    <span>
                      <b>{fee}</b> {unit}
                      {' '}
                      {sourceLink && (
                        <a className={styles.link} href={sourceLink} target="_blank">
                          <FormattedMessage id="FAQFeeApiLink" defaultMessage="(source)" />
                        </a>
                      )}
                    </span>
                  ) : (
                    <InlineLoader />
                  )}
                </div>
              )
            })}

            <br />

            <p className={styles.feeInfoTitle}>
              <FormattedMessage id="FAQServiceFee" defaultMessage="Service fee (only withdraw):" />
            </p>

            {adminFeeItems.map((item, index) => {
              const { ticker, percentFee } = item

              return (
                <p className={styles.descriptionFee} key={index}>
                  <span>{ticker}:</span>{' '}
                  {percentFee
                    ? (
                      <span>
                        {percentFee.fee + '%, '}
                        <FormattedMessage id="FAQServiceFeeDescription" defaultMessage="no less than" />
                        {' '}<b>{adminFee.calc(ticker, null)}</b> {ticker}
                      </span>
                    )
                    : <span>0%</span>
                  }
                </p>
              )
            })}
          </div>
        </article>

        <article className={styles.tab}>
          <h6 className={styles.tab__header} onClick={() => handleTabClick('THIRD_TAB')}>
            <div className={cx({
              [styles.chrest]: true,
              [styles.chrest_active]: tabsVisibility.THIRD_TAB,
            })} />
            <FormattedMessage id="MainFAQ3_header" defaultMessage="Why mining fee is too high?" />
          </h6>
          <div className={cx({
            [styles.tab__content]: true,
            [styles.tab__content_active]: tabsVisibility.THIRD_TAB,
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