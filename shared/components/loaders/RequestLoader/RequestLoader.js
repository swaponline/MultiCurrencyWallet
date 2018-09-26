import React from 'react'
import { connect } from 'redaction'

import Loader from 'components/loaders/Loader/Loader'
import SwapProgress from 'components/loaders/SwapProgress/SwapProgress'


const RequestLoader = ({ isVisible, text, txId, swap, data }) => {
  if (!isVisible) {
    return null
  }
  return (
    swap ? <SwapProgress data={data} /> : <Loader text={text} txId={txId} />
  )
}


export default connect({
  isVisible: 'loader.isVisible',
  text: 'loader.text',
  txId: 'loader.txId',
  swap: 'loader.swap',
  data: 'loader.data',
})(RequestLoader)
