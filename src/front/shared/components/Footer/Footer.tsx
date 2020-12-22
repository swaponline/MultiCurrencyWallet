import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import cx from 'classnames'
import { isMobile } from 'react-device-detect'
import { constants } from 'helpers'

import config from 'helpers/externalConfig'
import { connect } from 'redaction'

import styles from './Footer.scss'
import CSSModules from 'react-css-modules'

import SocialMenu from './SocialMenu/SocialMenu'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import SwitchLang from './SwitchLang/SwitchLang'

import version from 'helpers/version'


const Footer = (props) => {

  const isDark = localStorage.getItem(constants.localStorage.isDark)

  const isFooterDisabled = config.opts.ui.footerDisabled

  return (
    <footer
      className={cx({
        [styles.footer]: true,
        [styles.dark]: isDark,
        [styles.mobile]: isMobile,
      })}
      data-version-name={version.name}
      data-version-url={version.link}
    >
      {!isFooterDisabled && (
        //@ts-ignore
        <WidthContainer styleName="container">
          <SwitchLang {...props} />
          {!config.isWidget && <SocialMenu />}
          <div styleName="version">
            {version.link && version.name ?
              <a href={version.link} target="_blank">
                {version.name}
              </a>
              :
              <span>-</span>
            }
          </div>
        </WidthContainer>
      )}
    </footer>
  )
}

Footer.propTypes = {
  props: PropTypes.shape({
    serverAddress: PropTypes.string.isRequired,
    userEthAddress: PropTypes.string.isRequired,
  }),
}

export default withRouter(connect({
  'serverAddress': 'pubsubRoom.server',
  'userEthAddress': 'user.ethData.address',
  'dashboardView': 'ui.dashboardModalsAllowed',
  'modals': 'modals',
})(CSSModules(Footer, styles, { allowMultiple: true })))
