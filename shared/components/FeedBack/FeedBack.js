import React, { Fragment } from 'react'
import cssModules from 'react-css-modules'
import styles from './Feedback.scss'

import Href from 'components/Href/Href'

import TelegramImg from './images/telegram.png'


const FeedBack = ({link}) => (
    <div styleName="FeedBack">
       <h2 styleName="FeedBack__heading">Contacts</h2> 
       <div styleName="FeedBack__contact">
           <img src={TelegramImg} alt="" />
           <Href tab={link}>{link}</Href> 
           <span styleName="FeedBack__text">or</span>
           <Href tab="mailto:team@swap.online">team@swap.online</Href> 
           <span styleName="FeedBack__text">to find out further actions</span>
       </div>
    </div>
)

export default cssModules(FeedBack, styles)

