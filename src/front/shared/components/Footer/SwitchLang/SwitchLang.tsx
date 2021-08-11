import React from 'react'
import styles from './SwitchLang.scss'
import CSSModules from 'react-css-modules'

import { setCookie } from 'helpers/utils'
import { FormattedMessage, injectIntl } from 'react-intl'
import feedback from 'helpers/feedback'

const SwitchLang = (props) => {
  const { intl: { locale: intlLocale } } = props

  const switchLang = (event, locale) => {
    event.preventDefault()

    feedback.i18n.switched(locale)

    setCookie('mylang', locale.toUpperCase(), new Date(new Date().getFullYear() + 1, 1))

    window.setTimeout(() => {
      window.location.reload()
    }, 10)
  }

  const localeIsNotMatched = (locale) => {
    return intlLocale.toUpperCase() !== locale
      ? true
      : undefined // if url is undefined then we don't define styles
  }

  return (
    <div styleName="langSwitcher">
      <a
        href={localeIsNotMatched('EN') && '#/'}
        styleName="language"
        onClick={(e) => {
          switchLang(e, 'EN')
          return false
        }}
      >
        <FormattedMessage id="SwitchLang20" defaultMessage="EN" />
      </a>
      |
      <a
        href={localeIsNotMatched('RU') && '#/'}
        styleName="language"
        onClick={(e) => {
          switchLang(e, 'RU')
          return false
        }}
      >
        <FormattedMessage id="SwitchLang24" defaultMessage="RU" />
      </a>
      |
      <a
        href={localeIsNotMatched('NL') && '#/'}
        styleName="language"
        onClick={(e) => {
          switchLang(e, 'NL')
          return false
        }}
      >
        <FormattedMessage id="SwitchLangNL" defaultMessage="NL" />
      </a>
      |
      <a
        href={localeIsNotMatched('DE') && '#/'}
        styleName="language"
        onClick={(e) => {
          switchLang(e, 'DE')
          return false
        }}
      >
        <FormattedMessage id="SwitchLangDE" defaultMessage="DE" />
      </a>
      |
      <a
        href={localeIsNotMatched('ES') && '#/'}
        styleName="language"
        onClick={(e) => {
          switchLang(e, 'ES')
          return false
        }}
      >
        <FormattedMessage id="SwitchLangES" defaultMessage="ES" />
      </a>
      |
      <a
        href={localeIsNotMatched('PL') && '#/'}
        styleName="language"
        onClick={(e) => {
          switchLang(e, 'PL')
          return false
        }}
      >
        <FormattedMessage id="SwitchLangPL" defaultMessage="PL" />
      </a>
    </div>
  )
}

export default injectIntl(
  CSSModules(SwitchLang, styles, { allowMultiple: true })
)
