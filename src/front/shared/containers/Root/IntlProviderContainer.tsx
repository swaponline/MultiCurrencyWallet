import React from 'react'
import { IntlProvider } from 'react-intl'
import { Switch, Route, HashRouter } from 'react-router-dom'

import { getCookie } from 'helpers/utils'

import myNl from 'localisation/nl.json'
import myDe from 'localisation/de.json'
import myEn from 'localisation/en.json'
import myRu from 'localisation/ru.json'
import myEs from 'localisation/es.json'
import myPl from 'localisation/pl.json'
import myPt from 'localisation/pt.json'
import myKo from 'localisation/ko.json'
import myAr from 'localisation/ar.json'
import myFa from 'localisation/fa.json'


import { reduceMessages, defaultLocale } from 'helpers/locale'


const translations = {
  nl: reduceMessages(myNl),
  de: reduceMessages(myDe),
  en: reduceMessages(myEn),
  ru: reduceMessages(myRu),
  es: reduceMessages(myEs),
  pl: reduceMessages(myPl),
  pt: reduceMessages(myPt),
  ko: reduceMessages(myKo),
  ar: reduceMessages(myAr),
  fa: reduceMessages(myFa),
}

export default class IntlProviderContainer extends React.Component<any, any> {
  render() {
    const { children } = this.props
    let lang = 'en'

    return (
      <HashRouter>
        <Switch>
          <Route
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
                <IntlProvider
                  {...props}
                  key={currentLocale}
                  locale={currentLocale}
                  defaultLocale={defaultLocale()}
                  messages={messages}
                >
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
