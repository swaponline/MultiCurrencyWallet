import React, { Component } from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './ExchangeBlock.scss'

import SwapWindow from './SwapWindow/SwapWindow'
import SelectGroup from './SelectGroup/SelectGroup'


@CSSModules(styles)
export default class ExchangeBlock extends Component {
  render() {
    return (
      <div styleName="block">
        <SelectGroup />
      </div>
    )
  }
}
