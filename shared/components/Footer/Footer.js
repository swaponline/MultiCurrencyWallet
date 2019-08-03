import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { isMobile } from 'react-device-detect'

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
  <Fragment>
    {(!config.isWidget && !isMainOrPartialPages(props.location.pathname)) && (
      <WidthContainer styleName="shareText">
        <Referral address={props.userEthAddress} />
      </WidthContainer>
    )}
    {!config.isWidget && (
      <div styleName="footer">
        <WidthContainer styleName="container">
          <GetIeo />
          {!isMobile && (<Links />)}
          <SwitchLang />
          <SocialMenu />
          {!isMobile && <Info {...props} />}
          <span style={{ color: '#ffffff', fontSize: '12px', marginTop: '20px' }}>{config.time}</span>
        </WidthContainer>
      </div>
    )}
  </Fragment>
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
