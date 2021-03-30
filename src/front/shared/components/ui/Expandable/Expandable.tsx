import React, { Component, Fragment } from 'react'
import cssModules from 'react-css-modules'
import styles from './Expandable.scss'

interface IExpandableProps {
  title: string | JSX.Element,
  content: string | JSX.Element,
  onExpand?: () => void
}

interface IExpandableState {
  isOpened: boolean
}

@cssModules(styles, { allowMultiple: true })
export default class Expandable extends Component<IExpandableProps, IExpandableState> {

  constructor(props) {
    super(props)
    this.state = {
      isOpened: false,
    }
  }

  render() {
    const {
      title,
      content,
      onExpand
    } = this.props

    const { isOpened } = this.state

    return (
      <details onClick={isOpened ?
        () => {
          this.setState({ isOpened: false })
        }
        :
        () => {
          this.setState({ isOpened: true })
          onExpand && onExpand()
         }
      }>
        <summary>{title}</summary>
        {content}
      </details>
    )
  }
}
