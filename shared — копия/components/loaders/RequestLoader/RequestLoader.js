import React from 'react'
import { connect } from 'redaction'

import Loader from 'components/loaders/Loader/Loader'


const RequestLoader = ({ isVisible, text, txId }) => {
  if (!isVisible) {
    return null
  }

  return (
    <Loader text={text} txId={txId} />
  )
}


export default connect({
  isVisible: 'loader.isVisible',
  text: 'loader.text',
  txId: 'loader.txId',
})(RequestLoader)
