import React, { Fragment } from 'react'
import CSSModules from 'react-css-modules'
import styles from './Links.scss'

import links from 'helpers/links'


const Links = () => (
  <div styleName="links">
    <div styleName="column">
      <h4>Swap Online</h4>
      <a href={links.etherdelta} target="_blank" rel="noopener noreferrer">Buy/Sell token on etherdelta.com</a>
      <a href={links.test} target="_blank" rel="noopener noreferrer">Swap.Online Testnet</a>
      <a href={links.button} target="_blank" rel="noopener noreferrer">Swap.Button</a>
      <a href={links.about} target="_blank" rel="noopener noreferrer">About company</a>
      <a href={links.career} target="_blank" rel="noopener noreferrer">Career</a>
      <a href={links.contacts} target="_blank" rel="noopener noreferrer">Contacts</a>
    </div>
    <div styleName="column">
      <h4>Documentation</h4>
      <a href={links.concept} target="_blank" rel="noopener noreferrer">Project and Token Concept Summary (PDF)</a>
      <a href={links.description} target="_blank" rel="noopener noreferrer">Technical description of the protocol</a>
      <a href={links.research} target="_blank" rel="noopener noreferrer">DEX Trend Research</a>
    </div>
    <div styleName="column">
      <h4>Resources</h4>
      <a href={links.wiki} target="_blank" rel="noopener noreferrer">Wiki</a>
      <a href={links.github} target="_blank" rel="noopener noreferrer">GitHub Core</a>
      <a href={links.githubButton} target="_blank" rel="noopener noreferrer">GitHub Button</a>
      <a href={links.bitcointalkSendTx} target="_blank" rel="noopener noreferrer">Send bitcoin transacton</a>
    </div>
    <div styleName="column">
      <h4>Press</h4>
      <span>
        Reuters:
        <a href={links.reuters} target="_blank" rel="noopener noreferrer">
          Swap Online Release Details of their Decentralized Exchange of Bitcoin-to-Altcoins
        </a>
      </span>
      <a href={links.medium} target="_blank" rel="noopener noreferrer">Medium</a>
    </div>
  </div>
)

export default CSSModules(styles)(Links)
