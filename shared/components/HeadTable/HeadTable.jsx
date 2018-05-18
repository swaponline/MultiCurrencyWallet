import React from 'react'
import PropTypes from 'prop-types'

import './HeadTable.scss'

export default function HeadTable({ titles }) {
  return (
    <thead>
      <tr>{titles.map((item, index) =>
        (
          <th key={index}>
            <div className="table__headers">
              <span className="table__titles">{item}</span>
              { item === 'RATING' || item === 'PRICE' ? <span className="question">?</span> : ''}
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

