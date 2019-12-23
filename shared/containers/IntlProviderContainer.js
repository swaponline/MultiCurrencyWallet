import React, { Component } from 'react'
import { IntlProvider, addLocaleData } from 'react-intl'
import { Switch } from 'react-router-dom'
import { Route } from 'react-router'
import localeEn from 'react-intl/locale-data/en'
import localeRu from 'react-intl/locale-data/ru'


addLocaleData([...localeEn, ...localeRu])

import myEn from 'localisation/en.json'
import myRu from 'localisation/ru.json'


import { reduceMessages, defaultLocale, localisePrefix } from 'helpers/locale'


const translations = {
  en: reduceMessages(myEn),
  ru: reduceMessages(myRu),
}

export default class IntlProviderContainer extends Component {
  render() {
    const { children } = this.props
    return (
      <Switch>
        <Route
          path={localisePrefix}
          render={props => {
            const currentLocale = props.match.params.locale || defaultLocale()
            const messages = translations[currentLocale]

            return (
              <IntlProvider {...props} key={currentLocale} locale={currentLocale} defaultLocale={defaultLocale()} messages={messages}>
                {children}
              </IntlProvider>
            )
          }}
        />
      </Switch>
    )
  }
}
