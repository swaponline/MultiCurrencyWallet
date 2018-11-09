import React, { Component } from 'react'
import { IntlProvider, addLocaleData } from 'react-intl'
import localeEn from 'react-intl/locale-data/en'
import localeRu from 'react-intl/locale-data/ru'


addLocaleData([...localeEn, ...localeRu])

import myEn from 'localisation/en.json'
import myRu from 'localisation/ru.json'


import { reduceMessages, currentLocale, defaultLocale } from 'helpers/locale'


const translations = {
  en: reduceMessages(myEn),
  ru: reduceMessages(myRu),
}

export default class IntlProviderContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentLocale: currentLocale(),
      defaultLocale: defaultLocale(),
    }
  }

  render() {
    const { currentLocale, defaultLocale } = this.state
    const messages = translations[currentLocale]
    return (
      <IntlProvider locale={currentLocale} defaultLocale={defaultLocale} messages={messages}>
        {this.props.children}
      </IntlProvider>
    )
  }
}
