import React from 'react'
import proptypes from 'prop-types'

import './HeadTable.scss'

const HeadTable = ({ titles }) => (
    <thead>
        <tr>{titles.map((item, index) =>
            <th key={index}>    
                <div className="table__headers">
                    <span className="table__titles">{item}</span>
                    {item === 'RATING' || item === 'PRICE' ?
                        <span className="question">?</span> : ''}
                </div>
            </th>)}
        </tr>
    </thead>         
);

HeadTable.proptypes = {

}

export default HeadTable