import React from 'react'
import './Open.scss'

const Open = ({ open, newNotification }) => (
    <div className="users" onClick={ open }>
        <div className="users__user">
            <span className="users__user-letter">K</span>
            { newNotification === true ? 
                <span className="users__user-status"> </span>  : ''}
            
        </div>
    </div>
)

export default Open