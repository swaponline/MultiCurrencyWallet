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
          <a styleName="icon" href={links.medium}>
            <i className="fab fa-medium-m" />
          </a>
        </li>
        <li>
          <a styleName="icon" href={links.twitter}>
            <i styleName="icon" className="fab fa-twitter" />
          </a>
        </li>
        <li>
          <a styleName="icon" href={links.facebook}>
            <i styleName="icon" className="fab fa-facebook-f" />
          </a>
        </li>
        <li>
          <a styleName="icon" href={links.telegram}>
            <i styleName="icon" className="fab fa-telegram-plane" />
          </a>
        </li>
        <li>
          <a styleName="icon" href={links.bitcointalk}>
            <i styleName="icon" className="fab fa-btc" />
          </a>
        </li>
      </ul>
    )
  }
}
