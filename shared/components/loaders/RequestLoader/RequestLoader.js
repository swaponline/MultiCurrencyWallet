import React from 'react'
import { connect } from 'redaction'

import Loader from 'components/loaders/Loader/Loader'


const RequestLoader = ({ isVisible, text }) => {
  if (!isVisible) {
    return null
  }

  return (
    <Loader text={text} />
  )
}


export default connect({
  isVisible: 'loader.isVisible',
  text: 'loader.text',
})(RequestLoader)
