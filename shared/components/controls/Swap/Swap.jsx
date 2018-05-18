import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Swap.scss'

function Swap() {
  return (
    <a href="#" styleName="table__link">
      <svg xmlns="http://www.w3.org/2000/svg" width="7" height="10" viewBox="0 0 7 10">
        <path
          styleName="table__link-arrow"
          fill="none"
          fillRule="evenodd"
          stroke="#7c1de9"
          strokeLinecap="round"
          strokeWidth="2"
          d="M1 9l4-4-4-4" />
      </svg>
    </a>
  )
}

export default CSSModules(Swap, styles)

