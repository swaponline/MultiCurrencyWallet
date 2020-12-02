/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable max-len */
import React, { useState, useEffect } from 'react'
import cssModules from 'react-css-modules'
import { FormattedMessage, injectIntl } from 'react-intl'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import BigNumber from 'bignumber.js'
import { constants } from 'helpers'
import feedback from 'shared/helpers/feedback'
import helpers from 'helpers'

import cx from 'classnames'

import styles from './styles.scss'

const tabsIdsDictionary = {
  FIRST_TAB: 'MainFAQ1_header',
  SECOND_TAB: 'MainFAQ2_header',
  THIRD_TAB: 'MainFAQ3_header',
}


const FAQ = (props) => {
  const [btcFee, setBtcFee] = useState(null)
  const [ethFee, setEthFee] = useState(null)

  useEffect(() => {
    // remove memory leak
    let _mounted = true
    /* 
    * waiting for a response with fees and set them
    */
    let btcSatoshiPrice = null
    let ethGasPrice = null

    async function fetchFees() {
      try {
        if (_mounted) {
          const BYTE_IN_KB = 1024

          btcSatoshiPrice = await helpers.btc.estimateFeeRate({ speed: 'fast' })
          // divided by 1 kb to convert it to satoshi / byte
          setBtcFee(Math.ceil(btcSatoshiPrice / BYTE_IN_KB))

          ethGasPrice = await helpers.eth.estimateGasPrice({ speed: 'fast' })
          // return gas * 1e9 - divided by 1e9 to convert
          setEthFee(new BigNumber(ethGasPrice).dividedBy(1e9).toNumber())
        }
      } catch(err) {
        console.error('FAQ -> useEffect: ', err);
      }
    }

    fetchFees()
    return () => _mounted = false
  });


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
      //@ts-ignore
      feedback.faq.opened(formatMessage({ id: tabsIdsDictionary[tabName] }))
    }
    setOpenedTabsCounter({ ...openedTabsCounter, [tabName]: ++openedTabsCounter[tabName] })
  }

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
            <FormattedMessage id="MainFAQ2_content" defaultMessage="We take 0 fees in the middle for providing these services to you. However, you still have to pay the standard TX (miners fees) for all transactions you conduct on the platform." />
            <br />
            <br />
            <FormattedMessage id="MainFAQ2_content1" defaultMessage="For ERC20 tokens, it is required that you have at least 0.001 ETH on your wallets. Remember! when sending ERC20 tokens, you are required to hold some ETH as miners fees for transactions. This is also the case for all atomic swaps for ETH & ERC20 tokens." />
            <br />
            <br />
            <FormattedMessage id="MainFAQ2_content2" defaultMessage="NOTE: You can easily check the ‘miners fees’ required for each respective coin by simply googling them." />
            <br />
            <br />
            <FormattedMessage id="MainFAQ2_content3" defaultMessage="Current mining fees:" />
            <div className={styles.descriptionFee}>
              <span>BTC:</span>{' '}
              {btcFee
                ? <span><b>{btcFee}</b> sat/byte</span> 
                : <InlineLoader />
              }
            </div>
            <div className={styles.descriptionFee}>
              <span>ETH:</span>{' '}
              {ethFee
                ? <span><b>{ethFee}</b> gwei</span> 
                : <InlineLoader />
              }
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}

export default React.memo(cssModules(injectIntl(FAQ), styles, { allowMultiple: true }))
