import React from 'react'
import proptypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './HeadTable.scss'

const HeadTable = ({ titles }) => (
    <thead>
        <tr>
        { titles.map((item, index) => 
            <th key={index}>
                <div styleName="table__headers">
                    <span styleName="table__titles">{ item }</span>
                    { item === 'RATING' || item === 'PRICE' ?
                        <span styleName="question">?</span> : ''
                    }
                </div>
            </th>
        ) }
        </tr>
    </thead>         
)

HeadTable.proptypes = {

}

export default CSSModules(HeadTable, styles)