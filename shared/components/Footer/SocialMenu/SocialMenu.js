import React from 'react'
import CSSModules from 'react-css-modules'
import styles from './SocialMenu.scss'
import links from 'helpers/links'


const nav = [
  { links: links.medium,      icon: 'fa-medium-m'  },
  { links: links.twitter,     icon: 'fa-twitter'  },
  { links: links.facebook,    icon: 'fa-facebook'  },
  { links: links.telegram,    icon: 'fa-telegram-plane'  },
  { links: links.bitcointalk, icon: 'fa-btc' },
]

const SocialMenu = () => (
  <ul styleName="social-menu">
    {
      nav.map((item, index) => (
        <li key={index}>
          <a href={item.links} target="_blank" rel="noopener noreferrer">
            <i styleName="icon" className={`fab ${item.icon}`} />
          </a>
        </li>
      ))
    }
  </ul>
)

export default CSSModules(SocialMenu, styles)
