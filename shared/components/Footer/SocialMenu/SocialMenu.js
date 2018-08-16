import React from 'react'
import CSSModules from 'react-css-modules'
import styles from './SocialMenu.scss'
import links from 'helpers/links'

@CSSModules(styles)
export default class SocialMenu extends React.Component {
  render() {
    return (
      <ul styleName="social-menu">
        <li>
          <a href={links.medium}>
            <i styleName="icon" className="fab fa-medium-m" />
          </a>
        </li>
        <li>
          <a href={links.twitter}>
            <i styleName="icon" className="fab fa-twitter" />
          </a>
        </li>
        <li>
          <a href={links.facebook}>
            <i styleName="icon" className="fab fa-facebook-f" />
          </a>
        </li>
        <li>
          <a href={links.telegram}>
            <i styleName="icon" className="fab fa-telegram-plane" />
          </a>
        </li>
        <li>
          <a href={links.bitcointalk}>
            <i styleName="icon" className="fab fa-btc" />
          </a>
        </li>
      </ul>
    )
  }
}
