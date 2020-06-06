import React, { Component } from 'react'

import { connect } from 'redaction'

import { constants, getItezUrl } from 'helpers'
import actions from 'redux/actions'
import axios from 'axios'
import security from '../NotityBlock/images/security.svg'
import styles from '../NotityBlock/NotifyBlock.scss'
import NotifyBlock from '../NotityBlock/NotifyBock'
import ContentLoader from '../../../../components/loaders/ContentLoader/ContentLoader'

import { FormattedMessage, injectIntl } from 'react-intl'
import linksManager from '../../../../helpers/links'


@injectIntl
@connect(({ user }) => ({ user }))
export default class WallerSlider extends Component {
  constructor(props) {
    super(props)

    const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
    const mnemonicDeleted = mnemonic === '-'

    this.state = {
      mnemonicDeleted,
      isFetching: false,
    }
  }

  componentDidMount() {
    this.getBanners()
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

  getBanners = () => {
    const { user, intl: { locale } } = this.props

    if (window
      && window.bannersOnMainPage
      && window.bannersOnMainPage.length
    ) {
      // Используем банеры, которые были определены в index.html (используется в виджете вордпресса)
      this.setState(() => ({
        banners: window.bannersOnMainPage,
        isFetching: true,
      }), () => this.initBanners())
    } else {
      try {
        return axios
          .get('https://noxon.wpmix.net/swapBanners/banners.php')
          .then(({ data }) => {
            const banners = data.map(el => {
              if (el[4].includes('https://itez.swaponline.io/')) {
                const bannerArr = [...el]
                bannerArr.splice(4, 1, getItezUrl({ user, locale, url: el[4] }));

                return bannerArr
              }
              return el
            })
            this.setState(() => ({
              banners,
              isFetching: true,
            }), () => this.initBanners())
          })
          .catch(error => {
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

  render() {
    const { mnemonicDeleted, banners } = this.state

    const { multisigPendingCount } = this.props

    const isPrivateKeysSaved = localStorage.getItem(constants.localStorage.privateKeysSaved)

    let firstBtnTitle = <FormattedMessage id="descr282" defaultMessage="Show my keys" />
    if (!mnemonicDeleted) firstBtnTitle = <FormattedMessage id="ShowMyMnemonic" defaultMessage="Показать 12 слов" />

    const needSignMultisig = (
      <FormattedMessage
        id="Banner_YouAreHaveNotSignegTx"
        defaultMessage="{count} multisig transaction is waiting for your confirmation"
        values={{
          count: multisigPendingCount,
        }}
      />
    )

    return (window.location.hash !== linksManager.hashHome) ? null : (
      <div className="data-tut-banners">
        <h3 className={styles.bannersHeading}>
          <FormattedMessage id="ForYou" defaultMessage="For you" />
        </h3>
        {!this.state.isFetching ?
          <ContentLoader banners /> :
          <div id="swiper_banners" className="swiper-container" style={{ marginTop: '20px', marginBottom: '30px' }}>
            <div className="swiper-wrapper">
              {(multisigPendingCount > 0) && (
                <div className="swiper-slide">
                  <NotifyBlock
                    className="notifyIncomeRequest"
                    firstBtn={needSignMultisig}
                    widthIcon="80"
                    background="129218"
                    descr={needSignMultisig}
                    logDescr={`Click on btc ms notify block (banner)`}
                    firstFunc={this.handleGoToMultisigRequest}
                  />
                </div>
              )}
              {(!isPrivateKeysSaved && !mnemonicDeleted) && (
                <div className="swiper-slide">
                  <NotifyBlock
                    className="notifyBlockSaveKeys"
                    icon={security}
                    firstBtn={firstBtnTitle}
                    widthIcon="80"
                    background="6144e5"
                    descr={<FormattedMessage id="ShowMyMnemonic" defaultMessage="Please backup your wallet" />}
                    logDescr={`Click on save mnemonic notify block (banner)`}
                    firstFunc={mnemonicDeleted ? this.handleShowKeys : this.handleShowMnemonic}
                  />
                </div>
              )}
              {banners.map(banner => (
                <div key={banner[0]} className="swiper-slide">
                  <NotifyBlock background={`${banner[3]}`} descr={banner[2]} link={banner[4]} icon={banner[5]} />
                </div>
              ))}
            </div>
          </div>
        }
      </div>
    )
  }
}
