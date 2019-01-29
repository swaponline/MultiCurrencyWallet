import React, { Component, Fragment } from 'react'

import styles from './SwitchLang.scss'
import CSSModules from 'react-css-modules'

import { relocalisedUrl, localisedUrl } from 'helpers/locale'
import { FormattedMessage, injectIntl } from 'react-intl'


@injectIntl
@CSSModules(styles)
export default class SwitchLang extends Component {

  render() {
    const {intl: { locale }, className} = this.props

    return (
      <div>
        <a styleName="language" href={locale.toUpperCase() === 'RU' && relocalisedUrl(locale)}>
          <FormattedMessage id="SwitchLang20" defaultMessage="EN " />
        </a>
        |
        <a styleName="language" href={locale.toUpperCase() === 'EN'&& relocalisedUrl(locale)}>
          <FormattedMessage id="SwitchLang24" defaultMessage=" RU" />
        </a>
      </div>
    )
  }
}
