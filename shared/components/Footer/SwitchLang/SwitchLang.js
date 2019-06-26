import React, { Component, Fragment } from 'react'

import styles from './SwitchLang.scss'
import CSSModules from 'react-css-modules'

import { relocalisedUrl, localisedUrl } from 'helpers/locale'
import { setCookie } from 'helpers/utils'
import { FormattedMessage, injectIntl } from 'react-intl'


@injectIntl
@CSSModules(styles)
export default class SwitchLang extends Component {

  render() {
    const { intl: { locale }, className } = this.props

    return (
      <div>
        <a
          href={locale.toUpperCase() === 'RU' ? relocalisedUrl(locale) : undefined}
          styleName="language"
          onClick={() => setCookie('mylang', 'EN', new Date(new Date().getFullYear() + 1, 1))}
        >
          <FormattedMessage id="SwitchLang20" defaultMessage="EN " />
        </a>
        |
        <a
          href={locale.toUpperCase() === 'EN' ? relocalisedUrl(locale) : undefined}
          styleName="language"
          onClick={() => setCookie('mylang', 'RU', new Date(new Date().getFullYear() + 1, 1))}
        >
          <FormattedMessage id="SwitchLang24" defaultMessage=" RU" />
        </a>
      </div>
    )
  }
}
