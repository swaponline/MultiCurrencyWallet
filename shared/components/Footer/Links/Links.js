import React, { Fragment } from 'react'
import CSSModules from 'react-css-modules'
import styles from './Links.scss'


const Links = () => (
  <div styleName="links">
    <div styleName="left">
      <div styleName="column">
        <h4>Swap Online</h4>
        <a href="https://etherdelta.com/#0x14a52cf6b4f68431bd5d9524e4fcd6f41ce4ade9-ETH" target="_blank" rel="noopener">Buy/Sell token on etherdelta.com</a>
        <a href="https://testnet.swap.online/" target="_blank" rel="noopener">Swap.Online Testnet</a>
        <a href="https://wiki.swap.online/about-swap-online/#b2b" target="_blank" rel="noopener">Swap.Button</a>
        <a href="https://wiki.swap.online/about-swap-online/" target="_blank" rel="noopener">About company</a>
        <a href="https://wiki.swap.online/careers-swap-online/" target="_blank" rel="noopener">Career</a>
        <a href="https://wiki.swap.online/contacts-swap-online/" target="_blank" rel="noopener">Contacts</a>
      </div>
      <div styleName="column">
        <h4>Documentation</h4>
        <a href="https://wiki.swap.online/en.pdf" target="_blank" rel="noopener">Project and Token Concept Summary (PDF)</a>
        <a href="https://docs.google.com/document/d/1XNLzmNXkFeJWveJp62vFPQdjH8xabpeSm6ifbgj4MeM/edit?usp=sharing" target="_blank" rel="noopener">Technical description of the protocol</a>
        <a href="https://docs.google.com/spreadsheets/d/1qWFLK2y8oMH5Gfam-iwqXPzLtwNabzp_EL6QFxjSBc0/edit?usp=sharing" target="_blank" rel="noopener">DEX Trend Research</a>
      </div>
    </div>
    <div styleName="right">
      <div styleName="column">
        <h4>Resources</h4>
        <a href="https://wiki.swap.online" target="_blank" rel="noopener">Wiki</a>
        <a href="https://github.com/swaponline/swap.core" target="_blank" rel="noopener">GitHub Core</a>
        <a href="https://github.com/swaponline/swap.button" target="_blank" rel="noopener">GitHub Button</a>
        <a href="https://bitcointalk.org/index.php?topic=1938621.0" target="_blank" rel="noopener">Send bitcoin transacton</a>
      </div>
      <div styleName="column">
        <h4>Press</h4>
        <span>Reuters: <a href="https://www.reuters.com/brandfeatures/venture-capital/article?id=37488" target="_blank" rel="noopener">Swap Online Release Details of their Decentralized Exchange of Bitcoin-to-Altcoins</a></span>
        <a href="https://medium.com/@swaponline" target="_blank" rel="noopener">Medium</a>
      </div>
    </div>
  </div>
)

export default CSSModules(styles)(Links)
