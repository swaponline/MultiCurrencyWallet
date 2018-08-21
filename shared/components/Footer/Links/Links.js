import React, { Fragment } from 'react'
import CSSModules from 'react-css-modules'
import styles from './Links.scss'


const Links = () => (
  <Fragment>
    <div styleName="column">
      <h4>Swap Online</h4>
      <a href="https://etherdelta.com/#0x14a52cf6b4f68431bd5d9524e4fcd6f41ce4ade9-ETH" target="_blank" rel="noopener noreferrer">Buy/Sell token on etherdelta.com</a>
      <a href="https://testnet.swap.online/" target="_blank" rel="noopener noreferrer">Swap.Online Testnet</a>
      <a href="https://wiki.swap.online/about-swap-online/#b2b" target="_blank" rel="noopener noreferrer">Swap.Button</a>
      <a href="https://wiki.swap.online/about-swap-online/" target="_blank" rel="noopener noreferrer">About company</a>
      <a href="https://wiki.swap.online/careers-swap-online/" target="_blank" rel="noopener noreferrer">Career</a>
      <a href="https://wiki.swap.online/contacts-swap-online/" target="_blank" rel="noopener noreferrer">Contacts</a>
    </div>
    <div styleName="column">
      <h4>Documentation</h4>
      <a href="https://wiki.swap.online/en.pdf" target="_blank" rel="noopener noreferrer">Project and Token Concept Summary (PDF)</a>
      <a href="http://qps.ru/wKWr1" target="_blank" rel="noopener noreferrer">Technical description of the protocol</a>
      <a href="http://qps.ru/uqcOs" target="_blank" rel="noopener noreferrer">DEX Trend Research</a>
    </div>
    <div styleName="column">
      <h4>Press</h4>
      <span>Reuters:
        <a href="https://www.reuters.com/brandfeatures/venture-capital/article?id=37488" target="_blank" rel="noopener noreferrer">
        Swap Online Release Details of their Decentralized Exchange of Bitcoin-to-Altcoins
        </a>
      </span>
      <a href="https://medium.com/@swaponline" target="_blank" rel="noopener noreferrer">Medium</a>
    </div>
    <div styleName="column">
      <h4>Resources</h4>
      <a href="https://github.com/swaponline/swap.core" target="_blank" rel="noopener noreferrer">GitHub Core</a>
      <a href="https://github.com/swaponline/swap.button" target="_blank" rel="noopener noreferrer">GitHub Button</a>
      <a href="https://wiki.swap.online" target="_blank" rel="noopener noreferrer">Wiki</a>
      <a href="https://bitcointalk.org/index.php?topic=1938621.0" target="_blank" rel="noopener noreferrer">Send bitcoin transacton</a>
    </div>
  </Fragment>
)

export default CSSModules(styles)(Links)
