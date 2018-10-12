import React from 'react'
import PropTypes from 'prop-types'

import config from 'app-config'
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
      <span style={{ color: '#ffffff', fontSize: '12px' }}>{config.time}</span>
    </WidthContainer>
  </div>
)

Footer.propTypes = {
  props: PropTypes.shape({
    serverAddress: PropTypes.string.isRequired,
    isOnline: PropTypes.bool.isRequired,
    onlineUsers: PropTypes.number,
  }),
}

export default connect({
  'serverAddress': 'ipfs.server',
  'isOnline': 'ipfs.isOnline',
  'onlineUsers': 'ipfs.onlineUsers',
})(CSSModules(Footer, styles, { allowMultiple: true }))
