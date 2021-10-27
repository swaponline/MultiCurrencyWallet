import styles from './SwitchLang.scss'
import CSSModules from 'react-css-modules'

import { setCookie } from 'helpers/utils'
import { FormattedMessage, injectIntl } from 'react-intl'
import feedback from 'helpers/feedback'

const SwitchLang = (props) => {
  const {
    intl: { locale: intlLocale },
  } = props

  const switchLang = (event, locale) => {
    event.preventDefault()

    console.log('locale: ', locale)

    feedback.i18n.switched(locale)

    setCookie('mylang', locale.toLowerCase(), new Date(new Date().getFullYear() + 1, 1))

    window.setTimeout(() => {
      window.location.reload()
    }, 10)
  }

  const localeIsNotMatched = (locale) => {
    return intlLocale.toUpperCase() !== locale ? true : undefined // if url is undefined then we don't define styles
  }

  const languages = ['EN', 'RU', 'NL', 'ES', 'DE', 'PL', 'PT']

  return (
    <div styleName="langSwitcher">
      {languages.map((name, index) => {
        return (
          <a
            key={index}
            href={localeIsNotMatched(name) && '#/'}
            styleName="language"
            onClick={(e) => {
              switchLang(e, name)
              return false
            }}
          >
            {name}
          </a>
        )
      })}
    </div>
  )
}

export default injectIntl(CSSModules(SwitchLang, styles, { allowMultiple: true }))
