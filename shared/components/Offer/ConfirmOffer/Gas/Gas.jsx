import React from 'react'
import './Gas.scss'

export default function Gas() {
  return (
    <div className="confirm__row">
      <div className="confirm__title">Miner fee</div>
      <div className="confirm__fee">0.001 <span className="confirm__cur"> icx</span></div>
    </div>
  )
}

