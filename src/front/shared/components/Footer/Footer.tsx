import cx from 'classnames'
import { isMobile } from 'react-device-detect'
import { FormattedMessage } from 'react-intl'
import { links } from 'helpers'

import config from 'helpers/externalConfig'

import CSSModules from 'react-css-modules'
import version from 'helpers/version'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import styles from './Footer.scss'

import SocialMenu from './SocialMenu/SocialMenu'
import SwitchLang from './SwitchLang/SwitchLang'
import ServiceLinks from './ServiceLinks'

function Footer() {
  const showServiceLinks = !config.opts.ui.hideServiceLinks

  return (
    <footer
      className={cx({
        [styles.footer]: true,
        [styles.mobile]: isMobile,
      })}
      data-version-name={version.name}
      data-version-url={version.link}
    >
      { /* @ts-ignore */ }
      <WidthContainer styleName="container">
        <SwitchLang />

        {!config.isWidget && (
          <p styleName="swapDescription">
            <FormattedMessage
              id="FooterSwapDescription"
              defaultMessage="Online since 2018. Check our {twitter} and {github} history"
              values={{
                github: <a href={links.github} target="_blank" rel="noreferrer">github</a>,
                twitter: <a href={links.twitter} target="_blank" rel="noreferrer">twitter</a>,
              }}
            />
          </p>
        )}
        {!config.isWidget && <SocialMenu />}

        {showServiceLinks && (
          <ServiceLinks versionName={version.name} versionLink={version.link} />
        )}
      </WidthContainer>
    </footer>
  )
}

export default CSSModules(Footer, styles, { allowMultiple: true })
