import React, { Component, Fragment } from 'react'

import { constants } from 'helpers'
import actions from 'redux/actions'

import security from '../NotityBlock/images/security.svg'
import btcUsdt from '../NotityBlock/images/btcUsdt.svg'
import manageImgBackground from '../NotityBlock/images/manageImg.jpg'

import NotifyBlock from 'pages/Wallet/components/NotityBlock/NotifyBock'
import config from 'app-config'

import { FormattedMessage } from 'react-intl'

const isWidgetBuild = config && config.isWidget
const handleShowKeys = () => {
  actions.modals.open(constants.modals.DownloadModal)
}

const handleSaveKeys = () => {
  actions.modals.open(constants.modals.PrivateKeys)
}

const handleSignUp = () => {
  actions.modals.open(constants.modals.SignUp)
}

const slidesInit = () => {
  var starterSwiper = new Swiper('.swiper-container', {
    slidesPerView: 4,
    spaceBetween: 10
  })
}

export default props => {
  const {
    settings,
    isPrivateKeysSaved,
    isClosedNotifyBlockSignUp,
    isSigned,
    isClosedNotifyBlockBanner,
    handleNotifyBlockClose,
    host,
    banners
  } = props

  return isWidgetBuild ? null : (
    <Fragment>
      <div className="swiper-container" style={{ marginTop: '20px', marginBottom: '40px' }}>
        <div className="swiper-wrapper">
          {banners ? slidesInit() : ''}
          {banners.map(banner => (
            <div className="swiper-slide">
              <NotifyBlock background={`${banner[3]}`} descr={banner[2]} />
            </div>
          ))}
        </div>
      </div>
    </Fragment>
  )
}
