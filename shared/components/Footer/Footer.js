import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import cx from 'classnames'
import { isMobile } from 'react-device-detect'

import config from 'app-config'
import { connect } from 'redaction'

import styles from './Footer.scss'
import CSSModules from 'react-css-modules'

import Info from './Info/Info'
import SocialMenu from './SocialMenu/SocialMenu'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import SwitchLang from './SwitchLang/SwitchLang'


const Footer = (props) => {
  let showInfo = false
  if (window.location.hash.includes('/exchange')
    || window.location.hash.includes('/buy')
  ) showInfo = true
  return (
    <Fragment>
      {(!config.isWidget || config.isFullBuild) && (
        <div
          className={cx({
            [styles.footer]: true,
          })}
        >
          <WidthContainer styleName="container">
            {showInfo && <Info {...props} />}
            <SwitchLang {...props} />
            {!config.isWidget && <SocialMenu />}
            <span styleName="date">{config.time}</span>
          </WidthContainer>
        </div>
      )}
    </Fragment>
  )
}

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
  'dashboardView': 'ui.dashboardModalsAllowed',
  'modals': 'modals',
})(CSSModules(Footer, styles, { allowMultiple: true })))
