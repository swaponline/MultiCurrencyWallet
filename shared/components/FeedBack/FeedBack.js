import React, { Fragment } from 'react'
import cssModules from 'react-css-modules'
import styles from './Feedback.scss'

import Href from 'components/Href/Href'

import TelegramImg from './images/telegram.png'


const FeedBack = ({link, mailto}) => (
    <div styleName="FeedBack">
       <h2 styleName="FeedBackHeading">Contacts</h2> 
       <div styleName="FeedBackContact">
           <img src={TelegramImg} alt="" />
           <Href tab={link}>{link}</Href> 
           <span styleName="FeedBackText">or</span>
           <Href tab={mailto}>{mailto}</Href> 
           <span styleName="FeedBackText">to find out further actions</span>
       </div>
    </div>
)

export default cssModules(FeedBack, styles)

