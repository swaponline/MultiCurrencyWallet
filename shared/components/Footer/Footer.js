import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'

import config from 'app-config'
import { connect } from 'redaction'

import styles from './Footer.scss'
import CSSModules from 'react-css-modules'

import Referral from './Referral/Referral'
import Info from './Info/Info'
import Links from './Links/Links'
import SocialMenu from './SocialMenu/SocialMenu'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import SwitchLang from './SwitchLang/SwitchLang'
import GetIeo from './GetIeo/GetIeo'
import { isMainOrPartialPages } from 'helpers/locationPaths'


const Footer = (props) => (
  <div styleName="footer">
    <WidthContainer styleName="container">
      <GetIeo />
      {(!config.isWidget && !isMainOrPartialPages(props.location.pathname)) && (<Referral address={props.userEthAddress} />)}
      {!config.isWidget && (<Links />)}
      {!config.isWidget && (<SwitchLang />)}
      {!config.isWidget && (<SocialMenu />)}
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
    userEthAddress: PropTypes.string.isRequired,
  }),
}

export default withRouter(connect({
  'serverAddress': 'ipfs.server',
  'isOnline': 'ipfs.isOnline',
  'onlineUsers': 'ipfs.onlineUsers',
  'userEthAddress': 'user.ethData.address',
})(CSSModules(Footer, styles, { allowMultiple: true })))
