import styles from './SwitchLang.scss'
import CSSModules from 'react-css-modules'

import { setCookie } from 'helpers/utils'
import { FormattedMessage, injectIntl } from 'react-intl'
import feedback from 'helpers/feedback'

const DEFAULT_LANGUAGE = window.DEFAULT_LANGUAGE

const SwitchLang = (props) => {
  const {
    intl: { locale: intlLocale },
  } = props

  const switchLang = (event, locale) => {
    event.preventDefault()

    feedback.i18n.switched(locale)

    setCookie('mylang', locale.toUpperCase(), new Date(new Date().getFullYear() + 1, 1))

    window.setTimeout(() => {
      window.location.reload()
    }, 10)
  }

  const localeIsNotMatched = (locale) => {
    return intlLocale.toUpperCase() !== locale ? true : undefined // if url is undefined then we don't define styles
  }

  const itemInfo = [
    {
      name: 'EN',
      messageId: 'SwitchLang20',
    },
    {
      name: 'RU',
      messageId: 'SwitchLang24',
    },
    {
      name: 'NL',
      messageId: 'SwitchLangNL',
    },
    {
      name: 'ES',
      messageId: 'SwitchLangES',
    },
    {
      name: 'DE',
      messageId: 'SwitchLangDE',
    },
    {
      name: 'PL',
      messageId: 'SwitchLangPL',
    },
  ]

  return (
    <div styleName="langSwitcher">
      {itemInfo.map((info, index) => {
        return (
          <a
            key={index}
            href={localeIsNotMatched(info.name) && '#/'}
            styleName="language"
            onClick={(e) => {
              switchLang(e, info.name)
              return false
            }}
          >
            <FormattedMessage id={info.messageId} defaultMessage={info.name} />
          </a>
        )
      })}
    </div>
  )
}

export default injectIntl(CSSModules(SwitchLang, styles, { allowMultiple: true }))
