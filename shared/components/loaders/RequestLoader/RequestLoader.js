import React from 'react'
import PropTypes from 'prop-types'

import { connect } from 'redaction'
import Loader from '../Loader/Loader'
import SwapProgress from 'components/SwapProgress/SwapProgress'


const RequestLoader = ({ isVisible, text, txId, swap, data }) =>  {
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

// const RequestLoader = ({ isVisible, text, txId, swap, data}) => {
//   // if (!isVisible) {
//   //   return null
//   // }
//   return (
//     <SwapProgress data={data} />
//   )
// }
//
// RequestLoader.propTypes = {
//   isVisible: PropTypes.bool.isRequired,
// }
//
// RequestLoader.defaultProps = {
//   isVisible: false,
// }
//
//
// export default connect({
//   isVisible: 'loader.isVisible',
//   data: 'loader.data',
// })(RequestLoader)
