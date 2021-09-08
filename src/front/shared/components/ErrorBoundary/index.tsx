import React from 'react'
import { FormattedMessage } from 'react-intl'
import styles from './index.scss'
import cx from 'classnames'
import { feedback } from 'helpers'

type ComponentProps = {
  children: JSX.Element | JSX.Element[]
}

type ComponentState = {
  error: false | IError
  errorInfo: undefined | IUniversalObj
}

export default class ErrorBoundary extends React.Component<ComponentProps, ComponentState> {
  constructor(props) {
    super(props)

    this.state = {
      error: false,
      errorInfo: undefined,
    }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, errorInfo) {
    feedback.app.failed(`App Error: ${error.message}`)
    console.group('%c ERROR INTERCEPTED', 'color: red; font-size: 14px')
    console.error(error)
    console.groupEnd()

    this.setState(() => ({
      error,
      errorInfo,
    }))
  }

  render() {
    const { children } = this.props
    const { error } = this.state

    if (error) {
      return (
        <div
          className={cx({
            [styles.errorWrapper]: true,
          })}
        >
          <h2
            className={cx({
              [styles.errorTitle]: true,
            })}
          >
            <FormattedMessage
              id="AppErrorMessage"
              defaultMessage="Something wrong. Try to come back on the home page or reload this page."
            />
          </h2>

          {error.message ? (
            <pre
              className={cx({
                [styles.errorCode]: true,
              })}
            >
              Error: {error.message}
            </pre>
          ) : null}
        </div>
      )
    }

    return children
  }
}