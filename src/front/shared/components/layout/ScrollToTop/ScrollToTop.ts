import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'


class ScrollToTop extends Component<any, any> {
  componentDidUpdate(prevProps) {
    //@ts-ignore
    if (this.props.location.pathname !== prevProps.location.pathname) {
      window.scrollTo(0, 0)
    }
  }

  render() {
    //@ts-ignore
    return this.props.children
  }
}

export default withRouter(ScrollToTop)
