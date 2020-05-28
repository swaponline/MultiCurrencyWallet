import React, { Component } from 'react'
import { IntlProvider, addLocaleData } from 'react-intl'
import { Switch } from 'react-router-dom'
import { Route } from 'react-router'

import localeEn from 'react-intl/locale-data/en'
import localeDe from 'react-intl/locale-data/de'
import localeTr from 'react-intl/locale-data/tr'
import localeRu from 'react-intl/locale-data/ru'

import { getCookie } from 'helpers/utils'


addLocaleData([...localeEn, ...localeRu, ...localeDe, ...localeTr])

import myEn from 'localisation/en.json'
import myRu from 'localisation/ru.json'
import myDe from 'localisation/de.json'
import myTr from 'localisation/tr.json'

import { reduceMessages, defaultLocale, localisePrefix } from 'helpers/locale'


const translations = {
  en: reduceMessages(myEn),
  ru: reduceMessages(myRu),
  de: reduceMessages(myDe),
  tr: reduceMessages(myTr),
}

export default class IntlProviderContainer extends Component {
  render() {
    const { children } = this.props

    return (
      <Switch>
        <Route
          path={localisePrefix}
          render={props => {
            let currentLocale = defaultLocale()
            if (props.match.params.locale !== undefined) {
              currentLocale = props.match.params.locale
            } else {
              var lang = getCookie('mylang') ? getCookie('mylang') : 'en';
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
    )
  }
}
