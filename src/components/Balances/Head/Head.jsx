import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './Head.scss'

const Head = () => (
    <thead>
        <tr>
            <th>
                <div styleName="table__headers">
                    <span styleName="table__titles">Coin</span>
                </div>
            </th>
            <th>
                <div styleName="table__headers">
                    <span styleName="table__titles">Name</span>
                </div>
            </th>
            <th>
                <div styleName="table__headers">
                    <span styleName="table__titles">Available balance</span>
                </div>
            </th>
            <th>
                <div styleName="table__headers">
                    <span styleName="table__titles">Rating</span>
                </div>
            </th>
            <th></th>
        </tr>
    </thead>
)

Head.propTypes = {

};

export default CSSModules(Head, styles)

