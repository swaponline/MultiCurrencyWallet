import React, { Component } from 'react'
import PropTypes from 'prop-types'
import autosize from 'autosize'


const UPDATE  = 'autosize:update'
const DESTROY = 'autosize:destroy'
const RESIZED = 'autosize:resized'

export default class TextareaAutosize extends Component<any, any> {

  static propTypes = {
    valueLink: PropTypes.object.isRequired,
    onResize: PropTypes.func,
  }

  static defaultProps = {
    rows: 1,
  }

  textareaEl: any

  componentDidMount() {
    autosize(this.textareaEl)

    if (this.props.onResize) {
      this.textareaEl.addEventListener(RESIZED, this.props.onResize)
    }
  }

  componentWillUnmount() {
    if (this.props.onResize) {
      this.textareaEl.removeEventListener(RESIZED, this.props.onResize)
    }
    //@ts-ignore
    this.dispatchEvent(DESTROY)
  }

  componentWillReceiveProps(nextProps) {
    //@ts-ignore
    if (this.getValue(nextProps) !== this.getValue(this.props)) {
      this.dispatchEvent(UPDATE, true)
    }
  }

  dispatchEvent = (EVENT_TYPE, defer) => {
    const event = document.createEvent('Event')

    event.initEvent(EVENT_TYPE, true, false)

    const dispatch = () => this.textareaEl.dispatchEvent(event)

    if (defer) {
      setTimeout(dispatch)
    }
    else {
      dispatch()
    }
  }

  getValue = ({ valueLink, value }) => valueLink ? valueLink.value : value

  render() {
    const { valueLink, ...props } = this.props

    return (
      <textarea
        ref={(el) => this.textareaEl = el}
        {...props}
        value={valueLink.value}
        onChange={valueLink.action((x, e) => e.target.value)}
      />
    )
  }
}
