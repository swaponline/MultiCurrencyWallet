import React, { Component } from 'react'

import { constants } from 'helpers'

import styles from './SwitchLang.scss'
import CSSModules from 'react-css-modules'

import { relocalisedUrl } from 'helpers/locale'
import { setCookie } from 'helpers/utils'
import { FormattedMessage, injectIntl, IntlShape } from 'react-intl'
import feedback from 'helpers/feedback'

type PropsType = {
  props: any
  history: any
}

@injectIntl
@CSSModules(styles, { allowMultiple: true })
export default class SwitchLang extends Component<{intl: IntlShape}, PropsType> {
  switchLang = (event, locale) => {
    event.preventDefault()

    feedback.i18n.switched(locale)

    // @ts-ignore
    const { history } = this.props
    setCookie('mylang', locale.toUpperCase(), new Date(new Date().getFullYear() + 1, 1))
    // history.push(`${relocalisedUrl(locale)}`)
    window.setTimeout(() => {
      window.location.reload()
    }, 10)
  }

  render() {
    const {
      // @ts-ignore
      intl: { locale },
    } = this.props

    const isDark = localStorage.getItem(constants.localStorage.isDark)

    /*const languages: string[] = ['EN', 'RU', 123];*/

    return (
      <div styleName="langSwitcher">
        {/*{languages.forEach(language => {
          return language + '-'
        })}*/}
        <a
          href={locale.toUpperCase() !== 'EN' ? `#${relocalisedUrl(locale)}` : undefined}
          styleName={`language ${isDark ? '--dark' : ''}`}
          onClick={(e) => {
            this.switchLang(e, 'EN')
            return false
          }}
        >
          <FormattedMessage id="SwitchLang20" defaultMessage="EN" />
        </a>
        |
        <a
          href={locale.toUpperCase() !== 'RU' ? `#${relocalisedUrl(locale)}` : undefined}
          styleName={`language ${isDark ? '--dark' : ''}`}
          onClick={(e) => {
            this.switchLang(e, 'RU')
            return false
          }}
        >
          <FormattedMessage id="SwitchLang24" defaultMessage="RU" />
        </a>
        |
        <a
          href={locale.toUpperCase() !== 'NL' ? `#${relocalisedUrl(locale)}` : undefined}
          styleName={`language ${isDark ? '--dark' : ''}`}
          onClick={(e) => {
            this.switchLang(e, 'NL')
            return false
          }}
        >
          <FormattedMessage id="SwitchLangNL" defaultMessage="NL" />
        </a>
        |
        <a
          href={locale.toUpperCase() !== 'ES' ? `#${relocalisedUrl(locale)}` : undefined}
          styleName={`language ${isDark ? '--dark' : ''}`}
          onClick={(e) => {
            this.switchLang(e, 'ES')
            return false
          }}
        >
          <FormattedMessage id="SwitchLangES" defaultMessage="ES" />
        </a>
      </div>
    )
  }
}
