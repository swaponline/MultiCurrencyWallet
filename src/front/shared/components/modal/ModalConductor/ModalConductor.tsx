import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redaction'
import { getPageOffset } from 'helpers'

import Modals from 'components/modals'

import cssModules from 'react-css-modules'
import styles from './ModalConductor.scss'

@connect({
  modals: 'modals',
})
@cssModules(styles, { allowMultiple: true })
export default class ModalConductor extends Component<any, any> {

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
      if (myOffsetTop > 0) {
        this.setState({
          offsetTop: myOffsetTop,
        })
      }
    }
    else {
      if (offsetTop > 0) {
        window.scrollTo(0, offsetTop)

        this.setState({
          offsetTop: 0,
        })
      }
    }
  }

  render() {
    const { modals, history, dashboardView } = this.props

    const modalNames = Object.keys(modals)
    const highestZIndex = Object.values(modals)
      //@ts-ignore 
      .map(i => i.zIndex)
      .reduce((acc, i) => acc < i ? i : acc, 0)
    const areModalsExist = Boolean(modalNames.length)

    return areModalsExist && (
      <div styleName={`${!dashboardView ? 'modalConductor' : 'modalDashboardConductor'}`}>
        {
          modalNames.map((key, index) => {
            const { name, data = {}, zIndex } = modals[key]

            if (zIndex === highestZIndex) {
              return React.createElement(Modals[name], {
                key: index,
                name,
                data,
                history,
                style: { zIndex },
              })
            }
            return null
          })
        }
      </div>
    )
  }
}
