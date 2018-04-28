import React from 'react'
import proptypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './Head.scss'

const titles = ['EXCHANGE','PRICE','LIMITS','RATING']

const Head = () => (
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

Head.proptypes = {

}

export default CSSModules(Head, styles)