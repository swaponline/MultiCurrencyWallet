import React from 'react'

import cssModules from 'react-css-modules'
import styles from './Group.scss'

import { FieldLabel, Input } from 'components/forms'
import { Button } from 'components/controls'


const Group = ({ inputLink, placeholder, onClick, disabled }) => (
  <div styleName="group">
    <Input valueLink={inputLink} readOnly={disabled} placeholder={placeholder} styleName="input" pattern="0-9a-zA-Z" />
    <Button brand onClick={onClick} disabled={disabled} styleName="button" > Import</Button>
  </div>
)

export default cssModules(Group, styles)
