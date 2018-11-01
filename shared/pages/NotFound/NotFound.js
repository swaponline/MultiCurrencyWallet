import React from 'react'
import { FormattedMessage } from 'react-intl'


export default function NotFound() {
  return (
    <div className="container">
      <h2 className="description__sub-title">
        <FormattedMessage id="NotFound8" defaultMessage="Page not found!" />
      </h2>
    </div>
  )
}
