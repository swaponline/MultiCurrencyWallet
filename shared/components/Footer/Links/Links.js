import React, { Fragment } from 'react'

import styles from './Links.scss'
import CSSModules from 'react-css-modules'

import links from 'helpers/links'
import { FormattedMessage } from 'react-intl'


const link = [
  [
    { link: links.career, title: <FormattedMessage id="Careers" defaultMessage="Careers" />, header:   <FormattedMessage id="Company" defaultMessage="Company" /> },
    { link: links.button, title: <FormattedMessage id="Useswapbutton" defaultMessage="Use swap.button" /> },
    { link: links.about, title: <FormattedMessage id="AboutUS14" defaultMessage="About Us" /> },
    { link: links.extension, title: <FormattedMessage id="ChromeExtension" defaultMessage="Swap.Online Chrome Extension" /> },
  ],
  [
    { link: links.concept, title: <FormattedMessage id="Concept" defaultMessage="Concept (PDF)" />,
      header: <FormattedMessage id="Documentation" defaultMessage="Documentation" /> },
    { link: links.description, title: <FormattedMessage id="WhitePaperdraft" defaultMessage="White Paper (draft)" /> },
    { link: links.reuters, title: <FormattedMessage id="DEXdetails" defaultMessage="Details of Our DEX" /> },
    { link: links.research, title: <FormattedMessage id="DEXTrendResearch" defaultMessage="DEX Trend Research" /> },
  ],
  [
    { link: links.wiki, title: <FormattedMessage id="Wiki" defaultMessage="Wiki" />, header: <FormattedMessage id="Resources" defaultMessage="Resources" /> },
    { link: links.bitcointalkSendTx, title: <FormattedMessage id="SendBitcoinTransacton" defaultMessage="Send Bitcoin Transacton" /> },
    { link: links.github, title: 'github/swap.core' },
    { link: links.githubButton, title: 'github/swap.button ' },
  ],
  [
    { link: links.terms, title: <FormattedMessage id="Terms" defaultMessage="Terms" />, header: <FormattedMessage id="Legal" defaultMessage="Legal" /> },
    { link: links.privacyPolicy, title: <FormattedMessage id="PrivacyPolicy" defaultMessage="Privacy Policy" /> },
    { link: links.contacts, title: <FormattedMessage id="Contacts" defaultMessage="Contacts" /> },
    { link: links.legalOpinion, title: <FormattedMessage id="LegalOpinion" defaultMessage="Legal Opinion" /> },
  ],
]

const Rows = items => items.map((item, index) => (
  <Fragment key={index}>
    { item.header && <h4>{item.header}</h4> }
    <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>
  </Fragment>
))


const Links = () => (
  <div styleName="links">
    {
      link.map((items, index) => (
        <div styleName="column" key={index}>
          {
            Rows(items)
          }
        </div>
      ))
    }
  </div>
)

export default CSSModules(styles)(Links)
