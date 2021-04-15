import React from 'react'
import cx from 'classnames'
import { isMobile } from 'react-device-detect'
import { constants } from 'helpers'

import config from 'helpers/externalConfig'

import styles from './Footer.scss'
import CSSModules from 'react-css-modules'

import SocialMenu from './SocialMenu/SocialMenu'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import SwitchLang from './SwitchLang/SwitchLang'

import version from 'helpers/version'


const Footer = () => {
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
          <SwitchLang />

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

export default CSSModules(Footer, styles, { allowMultiple: true })
