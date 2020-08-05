import React, { Component } from 'react'
import classNames from 'classnames'
import { constants } from 'helpers'

import cssModules from 'react-css-modules'

import styles from './Panel.scss'


const isDark = localStorage.getItem(constants.localStorage.isDark)

@cssModules(styles, { allowMultiple: true })
export default class Panel extends Component {
  render() {
    return (
      <section styleName={classNames('panel', isDark ? 'dark' : null)}>
        { this.props.header &&
          <div styleName="panelHeader">
            { this.props.header }
          </div>
        }
        { this.props.children }
      </section>
    )
  }
}
