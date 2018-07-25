import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redaction'
import { getScrollBarWidth, getPageOffset } from 'helpers'

import Modals from 'components/modals'

import cssModules from 'react-css-modules'
import styles from './ModalConductor.scss'


@connect({
  modals: 'modals',
})
@cssModules(styles)
export default class ModalConductor extends Component {

  static propTypes = {
    modals: PropTypes.object,
  }

  state = {
    offsetTop: 0,
  }

  componentWillReceiveProps({ modals }) {
    const { offsetTop } = this.state

    const myOffsetTop = getPageOffset().y

    // When modal is showing add overflow: hidden to body and padding-right: ${scrollWidth}
    // to prevent screen from blinking
    if (Object.keys(modals).length) {
      document.body.classList.add('withOpenedModal')
      document.body.style.paddingRight = `${getScrollBarWidth()}px`

      if (myOffsetTop > 0) {
        this.setState({
          offsetTop: myOffsetTop,
        })
      }
    }
    else {
      document.body.classList.remove('withOpenedModal')
      document.body.style.paddingRight = '0px'

      if (offsetTop > 0) {
        window.scrollTo(0, offsetTop)

        this.setState({
          offsetTop: 0,
        })
      }
    }
  }

  render() {
    const { modals } = this.props

    const modalNames = Object.keys(modals)
    const areModalsExist = Boolean(modalNames.length)

    return areModalsExist && (
      <div styleName="modalConductor">
        {
          modalNames.map((key) => {
            const { name, data = {}, zIndex } = modals[key]

            return React.createElement(Modals[name], {
              key: name,
              name,
              data,
              style: { zIndex },
            })
          })
        }
      </div>
    )
  }
}
