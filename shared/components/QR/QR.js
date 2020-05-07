import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import cx from 'classnames'
import PropTypes from 'prop-types'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import animateFetching from 'components/loaders/ContentLoader/ElementLoading.scss'

import styles from './QR.scss'

/**
 * @todo Amount support?
 */
@CSSModules({ ...styles, ...animateFetching }, { allowMultiple: true })
export default class QR extends Component {

  constructor(props) {
    super()

    this.state = {
      renderQr: false,
    }
  }

  static propTypes = {
    network: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    size: PropTypes.number,
  }

  static defaultProps = {
    size: 250,
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ renderQr: true })
    }, 3000)
  }

  render() {
    let { network, address, size } = this.props

    // eslint-disable-next-line default-case
    switch (network.toLowerCase()) {
      case 'btc (multisig)':
      case 'btc (sms-protected)':
        network = 'btc'
        break
    }

    const addressHasNetwork = /:/.test(address)
    const networkValue = addressHasNetwork ? '' : `${network}:`

    return (
      <React.Fragment>
        <div className={styles.relativeWrapper}>
          <div className={styles.imageWrapper}>
            <img
              src={`https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${networkValue}${address}`}
              alt={`${network}: ${address}`}
            />
            <span className={cx({
              [styles.imageFaker]: true,
              [animateFetching['animate-fetching']]: !this.state.renderQr,
              [styles.hiddenEl]: this.state.renderQr,
            })} />
          </div>
        </div>
      </React.Fragment>
    )
  }
}
