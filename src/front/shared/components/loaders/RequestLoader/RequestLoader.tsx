import React from 'react'
import { connect } from 'redaction'
import Loader from '../Loader/Loader'

type ComponentProps = {
  isVisible?: boolean
  data: {
    txId: string
  }
}

const RequestLoader = (props: ComponentProps) => {
  const { isVisible = false, data } = props

  if (!isVisible) {
    return null
  }

  return <Loader data={data} />
}

export default connect({
  isVisible: 'loader.isVisible',
  data: 'loader.data',
})(RequestLoader)
