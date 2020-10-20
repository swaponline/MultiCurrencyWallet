import React, { Component } from 'react'
import { IntlProvider, addLocaleData } from 'react-intl'
import { Switch, Route, HashRouter } from 'react-router-dom'
import localeEn from 'react-intl/locale-data/en'
import localeRu from 'react-intl/locale-data/ru'
import localeNl from 'react-intl/locale-data/nl'
import localeEs from 'react-intl/locale-data/es'

import { getCookie } from 'helpers/utils'


addLocaleData([...localeEn, ...localeRu, ...localeNl, ...localeEs])

import myNl from 'localisation/nl.json'
import myEn from 'localisation/en.json'
import myRu from 'localisation/ru.json'
import myEs from 'localisation/es.json'


import { reduceMessages, defaultLocale, localisePrefix } from 'helpers/locale'


const translations = {
  nl: reduceMessages(myNl),
  en: reduceMessages(myEn),
  ru: reduceMessages(myRu),
  es: reduceMessages(myEs),
}

export default class IntlProviderContainer extends Component {
  render() {
    const { children } = this.props
    let lang = 'en'
    return (
      <HashRouter>
        <Switch>
          <Route
            path={localisePrefix}
            render={props => {
              let currentLocale = defaultLocale()
              if (props.match.params.locale !== undefined) {
                currentLocale = props.match.params.locale
              } else {
                lang = getCookie('mylang') || 'en'
                currentLocale = lang.toLowerCase()

              }

              const messages = translations[currentLocale]

              return (
                <IntlProvider {...props} key={currentLocale} locale={currentLocale} defaultLocale={defaultLocale()} messages={messages}>
                  {children}
                </IntlProvider>
              )
            }}
          />
        </Switch>
      </HashRouter>
    )
  }
}
