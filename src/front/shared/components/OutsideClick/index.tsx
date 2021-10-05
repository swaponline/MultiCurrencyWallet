import React, { Component } from 'react'

type OutsideClickProps = {
  children: JSX.Element[] | JSX.Element
  outsideAction: () => void
}

export default class OutsideClick extends Component<OutsideClickProps, object> {
  wrapperRef: Node

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  setWrapperRef = (node) => {
    this.wrapperRef = node
  }

  handleClickOutside = (event) => {
    const { outsideAction } = this.props

    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      outsideAction()
    }
  }

  render() {
    return <div ref={this.setWrapperRef}>{this.props.children}</div>
  }
}
