import React, { Fragment } from 'react'

import styles from './Links.scss'
import CSSModules from 'react-css-modules'

import links from 'helpers/links'
import { FormattedMessage } from 'react-intl'
import LogoTooltip from 'components/Logo/LogoTooltip'
import Logo from 'components/Logo/Logo'
import logoImage from 'components/Logo/images/logo.svg'


const link = [
  [
    /* Наши продукты (Our products) */
    { header: <FormattedMessage id="FooterOurProductsHeader" defaultMessage="Our products" />,
    /* Криптовалютный обменник (Exchange) https://swap.online/exchange */
      link : links.footer.exchange, title: <FormattedMessage id="FooterOurProductsExchange" defaultMessage="Exchange" /> },
    /* Криптовалютый онлайн кошелек (Wallet) https://swap.online */
    { link : links.footer.wallet, title: <FormattedMessage id="FooterOurProductsWallet" defaultMessage="Wallet" /> },
    /* Виджет для сайтов (Widget) https://widget.swap.online/ */
    { link : links.footer.widget, title: <FormattedMessage id="FooterOurProductsWidget" defaultMessage="Widget" /> },
    /* Chrome extantion https://chrome.google.com/webstore/detail/swaponline/oldojieloelkkfeacfinhcngmbkepnlm */
    { link : links.footer.chromeextantion, title: <FormattedMessage id="FooterOurProductsChromeExtantion" defaultMessage="Chrome extantion" /> },
    /* Bank dashboard */
    { link: links.footer.bankdashboard, title: <FormattedMessage id="FooterOurProductsBankDashboard" defaultMessage="Bank dashboard" /> },
  ],
  [
    /* Партнерам (Partnership) */
    { header: <FormattedMessage id="FooterPartnershipHeader" defaultMessage="Partnership" />,
    /* Для стейблкоинов (For stablecoins) https://wiki.swap.online/for_stablecoins/ */
      link: links.footer.forstablecoin, title: <FormattedMessage id="FooterPartnershipForstablecoin" defaultMessage="For stablecoins" /> },
    /* Другим DEX (For DEXes) https://wiki.swap.online/for_dexs/ */
    { link: links.footer.fordexses, title: <FormattedMessage id="FooterPartnershipForDEXes" defaultMessage="For DEXes" /> },
    /* Блокчейнам (For Blockchains) https://wiki.swap.online/for_blockchains/ */
    { link: links.footer.forblockchains, title: <FormattedMessage id="FooterPartnershipForBlockchains" defaultMessage="For Blockchains" /> },
    /* Токенам (For ERC20 tokens) https://listing.swap.online/ */
    { link: links.footer.forerc20tokens, title: <FormattedMessage id="FooterPartnershipForERC20" defaultMessage="For ERC20 tokens" /> },
    /* Виджет для криптосайтов (For news websites) https://widget.swap.online/ */
    { link: links.footer.fornewswebsites, title: <FormattedMessage id="FooterPartnershipForNewsWebsites" defaultMessage="For news websites" /> },
  ],
  [
    /* Технология (Technology) */
    { header: <FormattedMessage id="FooterTechnologyHeader" defaultMessage="Technology" />,
    /* Whitepaper https://wiki.swap.online/en.pdf */
      link: links.footer.whitepaper, title: <FormattedMessage id="FooterTechnologyWhitepaper" defaultMessage="Whitepaper" /> },
    /* Wiki https://wiki.swap.online/ */
    { link: links.footer.wiki, title: <FormattedMessage id="FooterTechnologyWiki" defaultMessage="Wiki" /> },
    /* GitHub https://github.com/swaponline */
    { link: links.footer.github, title: <FormattedMessage id="FooterTechnologyGithub" defaultMessage="GitHub" /> },
    /* Сравнение (Comparsion) */
    { link: links.footer.comparsion, title: <FormattedMessage id="FooterTechnologyComparsion" defaultMessage="Comparsion" /> },
    /* LN research */
    { link: links.footer.lnresearch, title: <FormattedMessage id="FooterTechnologyLNResearch" defaultMessage="LN" />, icon: 'lightling' },
  ],
  [
    /* О компании (About company) */
    { header: <FormattedMessage id="FooterAboutHeader" defaultMessage="About company" />,
    /* О компании (About company) https://wiki.swap.online/about-swap-online/ */
      link: links.footer.about, title: <FormattedMessage id="FooterAboutCompany" defaultMessage="About company" /> },
    /* Условия использования (Agreements) https://drive.google.com/file/d/0Bz2ZwZCmFtj_Nm9qSm0tUm9Ia1kwVGhWRlVlVXRJTGZtYW5N/view?usp=sharing */
    { link: links.footer.agreements, title: <FormattedMessage id="FooterAboutAgreements" defaultMessage="Agreements" /> },
    /* Политика конфиденциальности (Privacy policy) https://drive.google.com/file/d/1LdsCOfX_pOJAMqlL4g6DfUpZrGF5eRe9/view?usp=sharing */
    { link: links.footer.privacypolicy, title: <FormattedMessage id="FooterAboutPrivacyPolicy" defaultMessage="Privacy policy" /> },
    /* Юридическая правомерность (Legal) https://drive.google.com/file/d/0Bz2ZwZCmFtj_WlNkY0ZYN0ZpNUo2VFVEeW9rWEVoTlNja0VZ/view?usp=sharing */
    { link: links.footer.legal, title: <FormattedMessage id="FooterAboutLegal" defaultMessage="Legal" /> },
    /* Контакты (Contacts) https://wiki.swap.online/contacts-swap-online/ */
    { link: links.footer.contacts, title: <FormattedMessage id="FooterAboutContacts" defaultMessage="Contacts" /> },
  ],
]

const getIcon = (icon) => {
  switch (icon) {
    case 'lightling':
      return <img alt="Lightling" src="https://s.w.org/images/core/emoji/11/svg/26a1.svg" />
    default:
      return null
  }
}
const Rows = items => items.map((item, index) => (
  <li key={index}>
    { item.header && <h4>{item.header}</h4> }
    { item.icon && (
      <div>
        { getIcon(item.icon) }
        <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>
      </div>
    )}
    { !item.icon && (
      <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>
    )}
  </li>
))


const Links = () => {
  const { pathname } = window.location
  const isExchange = pathname.includes('/exchange') || pathname === '/' || pathname === '/ru'

  return (
    <div  styleName="links">
      <div styleName="logoPosition logo whiteFill">
        <img src={logoImage} alt="logo" />
      </div>
      <div styleName="linkPosition">
        {link.map((items, index) => (
          <ul styleName="column" key={index}>
            {Rows(items)}
          </ul>
        ))}
      </div>
    </div>
  )
}

export default CSSModules(styles, { allowMultiple: true })(Links)
