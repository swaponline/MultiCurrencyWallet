import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './User.scss'

// import Question from './controls/Question/Question'
import AddOfferButton from './AddOfferButton/AddOfferButton'
import UserAvatar from './UserAvatar/UserAvatar'
// import UserTooltip from './UserTooltip/UserTooltip'


@CSSModules(styles)
export default class User extends React.Component {

  render() {

    return (
      <div styleName="user-cont">
        {/* <Question /> */}
        <AddOfferButton />
        <UserAvatar />
      </div>
    )
  }
}
