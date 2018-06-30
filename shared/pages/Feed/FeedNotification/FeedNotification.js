import React, { Fragment } from 'react'
import PropTypes from 'prop-types'


const FeedNotificaton = ({ feeds, rowRender }) => (
  <Fragment>
    {
      feeds.map((row, rowIndex) => {
        if (typeof rowRender === 'function') {
          return rowRender(row, rowIndex)
        }
      })
    }
  </Fragment>
)

FeedNotificaton.propTypes = {
  feeds: PropTypes.array,
  rowRender: PropTypes.func,
}

export default FeedNotificaton
