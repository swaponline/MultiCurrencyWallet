import * as React from 'react'

import { connect } from 'redaction'

import Swiper from 'swiper'
import 'swiper/css/bundle'
import config from 'helpers/externalConfig'

import { constants, getItezUrl } from 'helpers'
import actions from 'redux/actions'
import axios from 'axios'
import security from '../images/security.svg'
import styles from '../NotityBlock/NotifyBlock.scss'
import NotifyBlock from '../NotityBlock/NotifyBlock'
import ContentLoader from 'components/loaders/ContentLoader/ContentLoader'
import { FormattedMessage, injectIntl } from 'react-intl'
import linksManager from 'helpers/links'


const disableInternalWallet = (config?.opts?.ui?.disableInternalWallet) ? true : false

type WallerSliderProps = {
  intl?: { [key: string]: any }
  user?: { [key: string]: any }
  multisigPendingCount: number
}

type WallerSliderState = {
  mnemonicDeleted: boolean
  isFetching: boolean
  metamaskConnected: boolean
  banners?: any[]
}

@connect(({ user }) => ({ user }))
class WallerSlider extends React.Component<WallerSliderProps, WallerSliderState> {
  _mounted = false

  constructor(props) {
    super(props)

    const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
    const mnemonicDeleted = mnemonic === '-'
    this.state = {
      mnemonicDeleted,
      isFetching: false,
      metamaskConnected: false,
    }
  }

  componentDidMount() {
    this._mounted = true
    this.getBanners()
  }

  componentWillUnmount() {
    this._mounted = false
  }

  initBanners = () => {
    let starterSwiper = new Swiper('#swiper_banners', {
      spaceBetween: 10,
      slidesPerView: 4,
      // centeredSlides: true,
      // loop: true,
      // Responsive breakpoints
      breakpoints: {
        480: {
          slidesPerView: 3,
        },
        // when window width is >= 640px
        640: {
          slidesPerView: 3,
          spaceBetween: 20,
        },
      },
    })
  }

  processItezBanner = (inBanners) => {
    const {
      user,
      //@ts-ignore: strictNullChecks
      intl: { locale: intlLocale },
    } = this.props

    let locale = intlLocale

    if (!locale) locale = `en`

    const oldItezUrl = 'https://itez.swaponline.io/'
    const newItezUrl = 'https://buy.itez.com/swaponline/'

    const banners = inBanners
      .map((el) => {
        let bannerUrl = el[4]
        if (bannerUrl.includes(oldItezUrl)) {
          bannerUrl = bannerUrl.replace(oldItezUrl, newItezUrl)
          const bannerArr = [...el]
          bannerArr.splice(4, 1, getItezUrl({ user, locale, url: bannerUrl }))

          return bannerArr
        }
        return el
      })
      .filter((el) => el && el.length)
    return banners
  }

  getBanners = () => {
    if (
      window &&
      window.bannersOnMainPage !== undefined
    ) {
      // Используем банеры, которые были определены в index.html (используется в виджете вордпресса)
      const widgetBanners = window.bannersOnMainPage.length ? window.bannersOnMainPage : []

      if (!this._mounted) return

      this.setState(
        () => ({
          banners: this.processItezBanner(widgetBanners).filter((el) => el && el.length),
          isFetching: true,
        }),
        () => this.initBanners()
      )
    } else {
      try {
        const bannersSource = config.opts.ui.bannersSource
        return axios
          .get(bannersSource)
          .then(({ data }) => {
            const banners = this.processItezBanner(data).filter((el) => el && el.length)

            if (!this._mounted) return

            this.setState(
              () => ({
                banners,
                isFetching: true,
              }),
              () => this.initBanners()
            )
          })
          .catch((error) => {
            console.error('getBanners:', error)
          })
      } catch (error) {
        console.error(error)
      }
    }
    return null
  }

  handleShowKeys = () => {
    actions.modals.open(constants.modals.DownloadModal)
  }

  handleSaveKeys = () => {
    actions.modals.open(constants.modals.PrivateKeys)
  }

  handleShowMnemonic = () => {
    //@ts-ignore: strictNullChecks
    actions.modals.open(constants.modals.SaveWalletSelectMethod, {
      onClose: () => {
        const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
        const mnemonicDeleted = mnemonic === '-'
        this.setState({
          mnemonicDeleted,
        })
      },
    })
  }

  handleGoToMultisigRequest = () => {
    actions.multisigTx.goToLastWallet()
  }

  render() {
    const { mnemonicDeleted, banners } = this.state
    const { multisigPendingCount } = this.props

    const isPrivateKeysSaved = localStorage.getItem(constants.localStorage.privateKeysSaved)

    const needSignMultisig = (
      <FormattedMessage
        id="Banner_YouAreHaveNotSignegTx"
        defaultMessage="{count} multisig transaction is waiting for your confirmation"
        values={{
          count: multisigPendingCount,
        }}
      />
    )

    return window.location.hash !== linksManager.hashHome ? null : (
      <div className="data-tut-banners">
        <h3 className={`${styles.bannersHeading}`}>
          <FormattedMessage id="ForYou" defaultMessage="For you" />
        </h3>
        {!this.state.isFetching ? (
          //@ts-ignore
          <ContentLoader banners />
        ) : (
          <div
            id="swiper_banners"
            className={`swiper ${styles.swiperContainer}`}
            style={{ marginTop: '20px', marginBottom: '30px', overflow: 'hidden' }}
          >
            <div className="swiper-wrapper">
              {multisigPendingCount > 0 && (
                <div className="swiper-slide">
                  <NotifyBlock
                    className="notifyIncomeRequest"
                    background="129218"
                    text={needSignMultisig}
                    feedbackText={`BTC multisig`}
                    onPress={this.handleGoToMultisigRequest}
                  />
                </div>
              )}
              {!isPrivateKeysSaved && !mnemonicDeleted && !disableInternalWallet && (
                <div className="swiper-slide">
                  <NotifyBlock
                    className="notifyBlockSaveKeys"
                    icon={security}
                    text={
                      <FormattedMessage
                        id="ShowMyMnemonic_copy"
                        defaultMessage="Please backup your wallet"
                      />
                    }
                    feedbackText={`Save mnemonic`}
                    onPress={mnemonicDeleted ? this.handleShowKeys : this.handleShowMnemonic}
                  />
                </div>
              )}
              {banners &&
                banners.length > 0 &&
                banners.map((banner, index) => (
                  <div key={index} className="swiper-slide">
                    <NotifyBlock
                      background={`${banner[3]}`}
                      icon={banner[5]}
                      text={banner[2]}
                      link={banner[4]}
                    />
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default injectIntl(WallerSlider)
