import React from 'react'
import { connect } from 'redaction'

import Loader from 'components/loaders/Loader/Loader'


const RequestLoader = ({ isVisible }) => isVisible && (
  <Loader />
)


export default connect({
  isVisible: 'loader.isVisible',
})(RequestLoader)
