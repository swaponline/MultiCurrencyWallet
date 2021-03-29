import React, { Component, Fragment } from 'react'
import cssModules from 'react-css-modules'
import styles from './Expandable.scss'

interface IExpandable {
  title: any,
  content: any,
}

@cssModules(styles, { allowMultiple: true })
export default class Expandable extends Component<IExpandable, {}> {

  constructor(props) {
    super(props)
  }

  render() {
    const {
      title,
      content,
    } = this.props

    return (
      <details>
        <summary>{title}</summary>
        {content}
    </details>
    )
  }
}
