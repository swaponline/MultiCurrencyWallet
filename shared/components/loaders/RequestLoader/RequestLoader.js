import React from 'react'
import PropTypes from 'prop-types'

import { connect } from 'redaction'
import Loader from '../Loader/Loader'


const RequestLoader = ({ isVisible, data }) => {
  if (!isVisible) {
    return null
  }

  return <Loader data={data} />
}

RequestLoader.propTypes = {
  isVisible: PropTypes.bool.isRequired,
}

RequestLoader.defaultProps = {
  isVisible: false,
}

export default connect({
  isVisible: 'loader.isVisible',
  data: 'loader.data',
})(RequestLoader)
