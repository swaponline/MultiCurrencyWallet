import React, { useState } from 'react'
import cssModules from 'react-css-modules'
import axios from 'axios'
import { FormattedMessage, injectIntl } from 'react-intl'
import cx from 'classnames'

import styles from './styles.scss'

const tabsIdsDictionary = {
  FIRST_TAB: 'MainFAQ1_header',
  SECOND_TAB: 'MainFAQ2_header',
  THIRD_TAB: 'MainFAQ3_header',
}

const FAQ = (props) => {
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

  const handleTabClick = (tabName) => {
    setOpenedTabs({ ...openedTabs, [tabName]: !openedTabs[tabName] })
    if (openedTabsCounter[tabName] === 0 && !window.location.host.includes('localhost')) {
      axios({
        url: `https://noxon.wpmix.net/counter.php?msg=${encodeURI(`На главной странице нажали на таб: "${formatMessage({ id: tabsIdsDictionary[tabName] })}"`)}`,
        method: 'post',
      }).catch(e => console.error(e))
    }
    setOpenedTabsCounter({ ...openedTabsCounter, [tabName]: ++openedTabsCounter[tabName] })
  }

  return (
    <div className={styles.faQuestions}>
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
            <FormattedMessage id="MainFAQ2_header" defaultMessage="WHAT ARE THE FEES INVOLVED?" />
          </h6>
          <div className={cx({
            [styles.tab__content]: true,
            [styles.tab__content_active]: openedTabs.SECOND_TAB,
          })}>
            <FormattedMessage id="MainFAQ2_content" defaultMessage="We take 0 fees in the middle for providing these services to you. However, you still have to pay the standard TX (miners fees) for all transactions you conduct on the platform." />
            <br/>
            <br/>
            <FormattedMessage id="MainFAQ2_content1" defaultMessage="For ERC20 tokens, it is required that you have at least 0.001 ETH on your wallets. Remember! when sending ERC20 tokens, you are required to hold some ETH as miners fees for transactions. This is also the case for all atomic swaps for ETH & ERC20 tokens." />
            <br/>
            <br/>
            <FormattedMessage id="MainFAQ2_content2" defaultMessage="NOTE: You can easily check the ‘miners fees’ required for each respective coin by simply googling them." />
          </div>
        </article>
        <article className={styles.tab}>
          <h6 className={styles.tab__header} onClick={() => handleTabClick('THIRD_TAB')}>
            <div className={cx({
              [styles.chrest]: true,
              [styles.chrest_active]: openedTabs.THIRD_TAB,
            })} />
            <FormattedMessage id="MainFAQ3_header" defaultMessage="How to save private keys?" />
          </h6>
          <div className={cx({
            [styles.tab__content]: true,
            [styles.tab__content_active]: openedTabs.THIRD_TAB,
          })}>
            <FormattedMessage id="MainFAQ3_content" defaultMessage={`For save you "12-words seed" click on "Please backup your wallet" banner. If you don't see this banner, don't despair just click on "dots" near your balance and select "Copy private key" option`} />
          </div>
        </article>
      </div>
    </div>
  )
}

export default React.memo(cssModules(injectIntl(FAQ), styles, { allowMultiple: true }))
