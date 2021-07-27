import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import animateFetching from 'components/loaders/ContentLoader/ElementLoading.scss'

import styles from './QR.scss'

type ComponentProps = {
  address: string
}

type ComponentState = {
  qrIsLoaded: boolean
}

@CSSModules({ ...styles, ...animateFetching }, { allowMultiple: true })
export default class QR extends Component<ComponentProps, ComponentState> {

  constructor(props) {
    super(props)

    this.state = {
      qrIsLoaded: false,
    }
  }

  setSuccessLoading = () => {
    const { qrIsLoaded } = this.state

    if (!qrIsLoaded) {
      this.setState(() => ({
        qrIsLoaded: true
      }))
    }
  }

  render() {
    const { address } = this.props
    const { qrIsLoaded } = this.state
    const size = 270

    return (
      <>
        <div className={styles.relativeWrapper}>
          <div className={styles.imageWrapper}>
            <img
              styleName={`${qrIsLoaded ? '' : 'hiddenEl'}`}
              src={`https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${address}`}
              onLoad={this.setSuccessLoading}
              alt={address}
            />
            <span styleName={`imageLoader ${qrIsLoaded ? 'hiddenEl' : 'animate-fetching'}`} />
          </div>
        </div>
      </>
    )
  }
}
