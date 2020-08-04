import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import cx from 'classnames'
import { isMobile } from 'react-device-detect'
import { constants } from 'helpers'

import config from 'app-config'
import { connect } from 'redaction'

import styles from './Footer.scss'
import CSSModules from 'react-css-modules'

import SocialMenu from './SocialMenu/SocialMenu'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import SwitchLang from './SwitchLang/SwitchLang'


const Footer = (props) => {

  const isDark = localStorage.getItem(constants.localStorage.isDark)

  return (
    <Fragment>
      {(!config.isWidget || config.isFullBuild) && (
        <div
          className={cx({
            [styles.footer]: true,
            [styles.dark]: isDark,
          })}
        >
          <WidthContainer styleName="container">
            <SwitchLang {...props} />
            {!config.isWidget && <SocialMenu />}
          </WidthContainer>
        </div>
      )}
    </Fragment>
  )
}

Footer.propTypes = {
  props: PropTypes.shape({
    serverAddress: PropTypes.string.isRequired,
    userEthAddress: PropTypes.string.isRequired,
  }),
}

export default withRouter(connect({
  'serverAddress': 'ipfs.server',
  'userEthAddress': 'user.ethData.address',
  'dashboardView': 'ui.dashboardModalsAllowed',
  'modals': 'modals',
})(CSSModules(Footer, styles, { allowMultiple: true })))
