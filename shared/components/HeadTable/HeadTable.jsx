import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './HeadTable.scss'

function HeadTable({ titles }) {
  return (
    <thead>
      <tr>{titles.map((item, index) =>
        (
          <th key={index}>
            <div styleName="table__headers">
              <span styleName="table__titles">{item}</span>
              { item === 'RATING' || item === 'PRICE' ? <span styleName="question">?</span> : ''}
            </div>
          </th>
        )
      )}
      </tr>
    </thead>
  )
}

HeadTable.propTypes = {
  titles: PropTypes.array.isRequired,
}

export default CSSModules(HeadTable, styles)
