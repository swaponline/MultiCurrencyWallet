import React from 'react'

import styles from './Feedback.scss'
import cssModules from 'react-css-modules'
import TelegramImg from './images/telegram.png'

import Href from 'components/Href/Href'


const FeedBack = ({ link }) => (
  <div styleName="FeedBack">
    <h2 styleName="heading">Contacts</h2>
    <div styleName="contact">
      <img src={TelegramImg} alt="" />
      <Href tab={link}>{link}</Href>
      <span styleName="text">or</span>
      <Href tab="mailto:team@swap.online">team@swap.online</Href>
      <span styleName="text">to find out further actions</span>
    </div>
  </div>
)

export default cssModules(FeedBack, styles)

