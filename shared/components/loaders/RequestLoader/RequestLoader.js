import React from 'react'
import PropTypes from 'prop-types'

import { connect } from 'redaction'

import SwapProgress from 'components/SwapProgress/SwapProgress'


const RequestLoader = ({ isVisible, data }) => {
  if (!isVisible) {
    return null
  }

  return <SwapProgress data={data} />
}

RequestLoader.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
}

RequestLoader.defaultProps = {
  isVisible: false,
}


export default connect({
  isVisible: 'loader.isVisible',
  data: 'loader.data',
})(RequestLoader)
