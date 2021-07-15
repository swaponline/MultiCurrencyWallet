import React, { Component } from 'react'
import classNames from 'classnames'
import cssModules from 'react-css-modules'
import styles from './Panel.scss'

@cssModules(styles, { allowMultiple: true })
export default class Panel extends Component<any, any> {
  render() {
    return (
      <section styleName={classNames('panel')}>
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
