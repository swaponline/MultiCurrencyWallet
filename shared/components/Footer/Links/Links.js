import React, { Fragment } from 'react'

import styles from './Links.scss'
import CSSModules from 'react-css-modules'

import links from 'helpers/links'


const link = [
  [
    { link: links.career, title: 'Careers', header: 'Company' },
    { link: links.button, title: 'Use swap.button' },
    { link: links.etherdelta, title: 'Buy&Sell Token' },
    { link: links.about, title: 'About Us' },
  ],
  [
    { link: links.concept, title: 'Concept (PDF)', header: 'Documentation' },
    { link: links.description, title: 'Technical Description' },
    { link: links.reuters, title: 'Details of Our DEX' },
    { link: links.research, title: 'DEX Trend Research' },
  ],
  [
    { link: links.wiki, title: 'Wiki', header: 'Resources' },
    { link: links.bitcointalkSendTx, title: 'Send Bitcoin Transacton' },
    { link: links.github, title: 'github/swap.core' },
    { link: links.githubButton, title: 'github/swap.button ' },
  ],
  [
    { link: links.terms, title: 'Terms', header: 'Legal' },
    { link: links.privacyPolicy, title: 'Privacy Policy' },
    { link: links.contacts, title: 'Contacts' },
    { link: links.legalOpinion, title: 'Legal Opinion' },
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
