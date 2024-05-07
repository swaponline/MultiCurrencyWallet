import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import QRCode from "react-qr-code"

import styles from './QR.scss'

type ComponentProps = {
  address: string
}

@CSSModules({ ...styles }, { allowMultiple: true })
export default class QR extends Component<ComponentProps, any> {

  constructor(props) {
    super(props)
  }

  render() {
    const { address } = this.props

    return (
      <div className={styles.relativeWrapper}>
        <div className={styles.imageWrapper}>
          <QRCode
            size={270}
            value={address}
            bgColor="var(--color-background)"
            fgColor="var(--color)"
          />
        </div>
      </div>
    )
  }
}
