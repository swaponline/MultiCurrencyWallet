import React from 'react'
import './Rating.scss'

export default function Rating() {
  return (
    <div className="confirm__row">
      <div className="confirm__title">Exchange rate</div>
      <div className="confirm__rate">
        <span className="confirm__rate-left">1 <span className="confirm__cur">eth</span></span>
        <span className="confirm__equal">=</span>
        <span className="confirm__rate-right">0.40922283 <span className="confirm__cur">eth</span></span>
      </div>
    </div>
  )
}

