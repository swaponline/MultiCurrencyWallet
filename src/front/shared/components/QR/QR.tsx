import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import cx from 'classnames'
import animateFetching from 'components/loaders/ContentLoader/ElementLoading.scss'

import styles from './QR.scss'

type ComponentProps = {
  address: string
}

type ComponentState = {
  renderQr: boolean
}

@CSSModules({ ...styles, ...animateFetching }, { allowMultiple: true })
export default class QR extends Component<ComponentProps, ComponentState> {

  constructor(props) {
    super(props)

    this.state = {
      renderQr: false,
    }
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ renderQr: true })
    }, 3000)
  }

  render() {
    const { address } = this.props
    const size = 270
    return (
      <React.Fragment>
        <div className={styles.relativeWrapper}>
          <div className={styles.imageWrapper}>
            <img
              src={`https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${address}`}
              alt={address}
            />
            <span className={cx({
              [styles.imageLoader]: true,
              [animateFetching['animate-fetching']]: !this.state.renderQr,
              [styles.hiddenEl]: this.state.renderQr,
            })} />
          </div>
        </div>
      </React.Fragment>
    )
  }
}
