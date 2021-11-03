import { FormattedMessage } from 'react-intl'
import { isMobile } from 'react-device-detect'
import { GoSettings } from 'react-icons/go'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { Sections } from './types'
import ThemeTooltip from 'components/ui/Tooltip/ThemeTooltip'

function Header(props) {
  const {
    section,
    wrongNetwork,
    receivedCurrency,
    openAggregatorSection,
    openSourceSection,
    openSettingsSection,
  } = props

  return (
    <div styleName="header">
      <>
        <button
          id="aggregatorSectionDescription"
          styleName={`tab ${section === Sections.Aggregator ? 'active' : ''}`}
          onClick={openAggregatorSection}
        >
          <FormattedMessage id="aggregator" defaultMessage="Aggregator" />
        </button>

        <ThemeTooltip id="aggregatorSectionDescription" effect="solid" place="top">
          <FormattedMessage
            id="jkjkg123lg12l323434pj"
            defaultMessage="aggregator section description"
          />
        </ThemeTooltip>
      </>

      <>
        <button
          id="sourceSectionDescription"
          styleName={`tab ${section === Sections.Source ? 'active' : ''}`}
          onClick={openSourceSection}
        >
          <FormattedMessage id="source" defaultMessage="Source" />
        </button>

        <ThemeTooltip id="sourceSectionDescription" effect="solid" place="top">
          <FormattedMessage id="jkjkg123lg12l3" defaultMessage="source section description" />
        </ThemeTooltip>
      </>

      <button
        styleName={`tab ${section === Sections.Settings ? 'active' : ''} ${
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
