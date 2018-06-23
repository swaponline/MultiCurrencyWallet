import React from 'react'

import cssModules from 'react-css-modules'
import styles from './Confirm.scss'

import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import Button from 'components/controls/Button/Button'


const Confirm = ({ isConfirm, isReject, title, animation }) => (
  <div styleName={animation ? 'confirm animation' : 'confirm'} >
    <SubTitle>
      {title}
    </SubTitle>
    <div styleName="row" >
      <Button brand onClick={isConfirm}>Yes</Button>
      <Button brand onClick={isReject}>No</Button>
    </div>
  </div>
)

export default cssModules(Confirm, styles, { allowMultiple: true })
