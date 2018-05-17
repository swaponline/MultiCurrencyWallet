import React from 'react'

import './Exchange.scss'

const Exchange = () => (
  <div className="confirm__row">
    <div className="confirm__title">Exchange</div>
    <div className="confirm__from-to">
      <span className="confirm__from">12.278079 <span className="confirm__cur">eth</span></span>
      <span className="confirm__arrow"><img src="img/arrow-right.svg" alt="" /></span>
      <span className="confirm__to">7.75056072 <span className="confirm__cur">icx</span></span>
    </div>
  </div>
)

export default Exchange
