import React, { Fragment } from 'react'

import styles from './Links.scss'
import CSSModules from 'react-css-modules'

import links from 'helpers/links'
import { FormattedMessage } from 'react-intl'


const link = [
  [
    { link: links.about, title: <FormattedMessage id="AboutUS14" defaultMessage="About Us" />, header: <FormattedMessage id="Company" defaultMessage="Company" /> },
    { link: links.career, title: <FormattedMessage id="Careers" defaultMessage="Careers" /> },
    { link: links.contacts, title: <FormattedMessage id="Contacts" defaultMessage="Contacts" /> },
  ],
  [
    {
      link: links.button, title: <FormattedMessage id="Useswapbutton" defaultMessage="Swap Button" />,
      header: <FormattedMessage id="Documentation" defaultMessage="Products" />,
    },
    { link: links.reuters, title: <FormattedMessage id="DEXdetails" defaultMessage="DEX Details" /> },
    { link: links.research, title: <FormattedMessage id="DEXTrendResearch" defaultMessage="DEX Trend Research" /> },
  ],
  [
    { link: links.wiki, title: <FormattedMessage id="Wiki" defaultMessage="Wiki" />, header: <FormattedMessage id="Resources" defaultMessage="Resources" /> },
    { link: links.github, title: <FormattedMessage id="GitHub" defaultMessage="GitHub" /> },
    { link: links.extension, title: <FormattedMessage id="ChromeExtension" defaultMessage="Chrome Extension" /> },
    { link: links.concept, title: <FormattedMessage id="Concept" defaultMessage="Concept" /> },
    { link: links.description, title: <FormattedMessage id="WhitePaperdraft" defaultMessage="White Paper" /> },
    // { link: links.bitcointalkSendTx, title: <FormattedMessage id="SendBitcoinTransacton" defaultMessage="Send Bitcoin Transacton" /> },
  ],
  [
    { link: links.terms, title: <FormattedMessage id="Terms" defaultMessage="Terms of use" />, header: <FormattedMessage id="Legal" defaultMessage="Legal" /> },
    { link: links.privacyPolicy, title: <FormattedMessage id="PrivacyPolicy" defaultMessage="Privacy Policy" /> },
    { link: links.legalOpinion, title: <FormattedMessage id="LegalOpinion" defaultMessage="Legal Opinion" /> },
    { link: links.licence, title: <FormattedMessage id="Licence" defaultMessage="Licence" /> },
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
