import * as React from 'react'

import { connect } from 'redaction'

import { constants, getItezUrl } from 'helpers'
import actions from 'redux/actions'
import axios from 'axios'
import security from '../NotityBlock/images/security.svg'
import styles from '../NotityBlock/NotifyBlock.scss'
import NotifyBlock from '../NotityBlock/NotifyBlock'
import ContentLoader from '../../../../components/loaders/ContentLoader/ContentLoader'

import { FormattedMessage, injectIntl } from 'react-intl'
import linksManager from '../../../../helpers/links'

import metamask from 'helpers/metamask'

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

const isDark = localStorage.getItem(constants.localStorage.isDark)
@injectIntl
@connect(({ user }) => ({ user }))
export default class WallerSlider extends React.Component {

  props: WallerSliderProps
  state: WallerSliderState
  
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
    //@ts-ignore
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
      intl: { locale: intlLocale },
    } = this.props

    let locale = intlLocale

    if (!locale) locale = `en`

    const banners = inBanners
      .map((el) => {
        if (el[4].includes('https://itez.swaponline.io/')) {
          const bannerArr = [...el]
          bannerArr.splice(4, 1, getItezUrl({ user, locale, url: el[4] }))

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
        return axios
          .get('https://noxon.wpmix.net/swapBanners/banners.php')
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
    actions.modals.open(constants.modals.SaveMnemonicModal, {
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

  handleSignUp = () => {
    actions.modals.open(constants.modals.SignUp)
  }

  handleConnectMetamask = () => {
    metamask.connect({}).then((connected) => {
      if (connected) {
        this.setState({
          metamaskConnected: true,
        })
      }
    })
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
        <h3 className={`${styles.bannersHeading} ${isDark ? styles.dark : ''}`}>
          <FormattedMessage id="ForYou" defaultMessage="For you" />
        </h3>
        {!this.state.isFetching ? (
          //@ts-ignore
          <ContentLoader banners />
        ) : (
          <div
            id="swiper_banners"
            className="swiper-container"
            style={{ marginTop: '20px', marginBottom: '30px' }}
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
              {!isPrivateKeysSaved && !mnemonicDeleted && (
                <div className="swiper-slide">
                  <NotifyBlock
                    className="notifyBlockSaveKeys"
                    background="6144e5"
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
                banners.map((banner) => (
                  <div key={banner[0]} className="swiper-slide">
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
