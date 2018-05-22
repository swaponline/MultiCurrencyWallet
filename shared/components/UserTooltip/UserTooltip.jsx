import React, { Component } from 'react'
import { connect } from 'redaction'

import CSSModules from 'react-css-modules'
import styles from './UserTooltip.scss'

import ArrowRightSvg from './arrow-right.svg'
import AcceptSvg from './accept.svg'


@connect(state => ({
  open: state.notification.open,
  name: state.notification.name,
  data: { ...state.notification.data },
}))
@CSSModules(styles)
export default class UserTooltip extends Component {
  render() {
    const { data, name } = this.props
    return (
      <div styleName="user-tooltip">
        <p>{ name === '' ? 'Nothing' : name }</p>
      </div>
    )
  }
}

// swap notification
// <div className="user-tooltip__info">
//     <div className="user-tooltip__info-title">User want to swap</div>
//     <div className="user-tooltip__currency">
//         <span className="user-tooltip__from">10 <span className="user-tooltip__coin">eth</span></span>
//         <span className="user-tooltip__arrow"><img src={ArrowRightSvg} alt=""/></span>
//         <span className="user-tooltip__to">1 <span className="user-tooltip__coin">btc</span></span>
//     </div>
// </div>

// <div className="user-tooltip__checked" >
//     <img src={AcceptSvg} alt=""/>
// </div>
