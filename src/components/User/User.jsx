import React from 'react'
import './User.scss'

import UserTooltip from '../UserTooltip/UserTooltip'
import Add from '../controls/Add/Add'
import Question from '../controls/Question/Question'
import Open from '../controls/Open/Open'

const User = () => (
    <div className="user-cont">
        <Question />
        <Add />
        <Open />
        <UserTooltip />
    </div>
)

export default User