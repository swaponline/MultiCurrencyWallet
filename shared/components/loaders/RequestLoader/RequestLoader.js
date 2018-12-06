import React from 'react'
import PropTypes from 'prop-types'

import { connect } from 'redaction'
import Loader from '../Loader/Loader'
import SwapProgress from 'components/SwapProgress/SwapProgress'


const RequestLoader = ({ isVisible, text, txId, swap, data }) => {
  if (!isVisible) {
    return null
  }
  return (
    <Loader text={text} txId={txId} />
  )
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
