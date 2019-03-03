import React from 'react'
import PropTypes from 'prop-types'

import cssModules from 'react-css-modules'
import styles from './Popup.scss'


@cssModules(styles, { allowMultiple: true })
export default class Popup extends React.PureComponent {
  static propTypes = {
    active: PropTypes.bool.isRequired,
    onClickOverlay: PropTypes.func.isRequired,
  }

  handleClickOverlay = (e) => {
    if (e.target === this.Popup) {
      this.props.onClickOverlay(e)
    }
  }

  render() {
    const { children, active } = this.props
    return (
      <div
        styleName={`Popup${active ? ' Popup_active' : ''}`}
        ref={ref => this.Popup = ref}
        onClick={(e) => this.handleClickOverlay(e)} // eslint-disable-line
      >
        <div styleName="Popup__content">
          {children}
        </div>
      </div>
    )
  }
}
