import React, { Fragment } from 'react'

import styles from './Links.scss'
import CSSModules from 'react-css-modules'

import links from 'helpers/links'


const link = [
  [
    { link: links.career, title: 'Career', header: 'Company' },
    { link: links.button, title: 'Swap.Button' },
    { link: links.etherdelta, title: 'Buy/Sell token' },
    { link: links.about, title: 'About company' },
  ],
  [
    { link: links.concept, title: 'Concept (PDF)', header: 'Documentation' },
    { link: links.reuters, title: 'Details of their DEX' },
    { link: links.research, title: 'DEX Trend Research' },
    { link: links.description, title: 'Technical description' },
  ],
  [
    { link: links.wiki, title: 'Wiki', header: 'Resources' },
    { link: links.github, title: 'GitHub Core' },
    { link: links.githubButton, title: 'GitHub Button' },
    { link: links.bitcointalkSendTx, title: 'Send bitcoin transacton' },
  ],
  [
    { link: links.terms, title: 'Terms', header: 'Legal' },
    { link: links.contacts, title: 'Contacts' },
    { link: links.legalOpinion, title: 'Legal opinion' },
    { link: links.privacyPolicy, title: 'Privacy Policy' },
  ],
]

const Rows = items => items.map(item => (
  <Fragment>
    { item.header && <h4>{item.header}</h4> }
    <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>
  </Fragment>
))


const Links = () => (
  <div styleName="links">
    {
      link.map(items => (
        <div styleName="column">
          {
            Rows(items)
          }
        </div>
      ))
    }
  </div>
)

export default CSSModules(styles)(Links)
