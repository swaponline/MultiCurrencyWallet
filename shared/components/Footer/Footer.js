import React from 'react'
import { connect } from 'redaction'

import styles from './Footer.scss'
import CSSModules from 'react-css-modules'

import Info from './Info/Info'
import Links from './Links/Links'
import SocialMenu from './SocialMenu/SocialMenu'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'


const Footer = (props) => (
  <div styleName="footer">
    <WidthContainer styleName="container">
      <Links />
      <SocialMenu />
      <Info {...props} />
    </WidthContainer>
  </div>
)

export default connect({
  'server': 'ipfs.server',
  'isOnline': 'ipfs.isOnline',
  'onlineUsers': 'ipfs.onlineUsers',
})(CSSModules(Footer, styles, { allowMultiple: true }))
