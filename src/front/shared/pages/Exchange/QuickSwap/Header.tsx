import { FormattedMessage } from 'react-intl'
import { isMobile } from 'react-device-detect'
import { GoSettings } from 'react-icons/go'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { externalConfig } from 'helpers'
import { Sections } from './types'

function Header(props) {
  const {
    activeSection,
    wrongNetwork,
    receivedCurrency,
    openAggregatorSection,
    openSourceSection,
    openSettingsSection,
  } = props

  return (
    <div styleName="header">
      <button
        styleName={`tab ${activeSection === Sections.Aggregator ? 'active' : ''} ${
          externalConfig.entry === 'testnet' ? 'disabled' : ''
        }`}
        onClick={openAggregatorSection}
      >
        <FormattedMessage id="aggregator" defaultMessage="Aggregator" />
      </button>

      <button
        id="sourceSectionDescription"
        styleName={`tab ${activeSection === Sections.Source ? 'active' : ''}`}
        onClick={openSourceSection}
      >
        <FormattedMessage id="source" defaultMessage="Source" />
      </button>

      <button
        styleName={`tab ${activeSection === Sections.Settings ? 'active' : ''} ${
          wrongNetwork || receivedCurrency.notExist ? 'disabled' : ''
        }`}
        onClick={openSettingsSection}
      >
        {isMobile ? (
          <GoSettings alt="swap settings" />
        ) : (
          <FormattedMessage id="settings" defaultMessage="Settings" />
        )}
      </button>
    </div>
  )
}

export default CSSModules(Header, styles, { allowMultiple: true })
