import React from 'react'
import { IntlProvider } from 'react-intl'
import { Switch, Route, HashRouter } from 'react-router-dom'

import { getCookie } from 'helpers/utils'

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

export default class IntlProviderContainer extends React.Component<any, any> {
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
