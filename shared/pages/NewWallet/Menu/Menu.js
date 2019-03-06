import React, { Component } from 'react'

import styles from './Menu.scss'
import cssModules from 'react-css-modules'

import CurrencySlider from '../Components/CurrencySlider/CurrencySlider'


@cssModules(styles)
export default class Menu extends Component {
  render() {
    return (
      <ul styleName="menu">
        <li styleName="menuItem">
          <a styleName="menuLink">
            Our projects
          </a>
        </li>
        <li styleName="menuItem">
          <a styleName="menuLink">
            Our vision
          </a>
        </li>
        <li styleName="menuItem">
          <a styleName="menuLink">
            How to invest
          </a>
        </li>
      </ul>
    )
  }
}
