import React, { Component } from 'react'

import styles from './Menu.scss'
import cssModules from 'react-css-modules'


const titles = [
  'Our projects',
  'Our vision',
  'How to invest'
]

@cssModules(styles)
export default class Menu extends Component {
  render() {
    return (
      <ul styleName="menu">
      {titles.map((items, index) => (
        <li styleName="menuItem">
          <a styleName="menuLink">
            {items}
          </a>
        </li>
        ))}
      </ul>
    )
  }
}
