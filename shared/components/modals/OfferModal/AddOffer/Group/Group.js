import React, { Fragment } from 'react'

import styles from './Group.scss'
import cssModules from 'react-css-modules'

import Input from 'components/forms/Input/Input'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'


const Group = ({ className, disabled, label, id, inputValueLink, isInteger = false, placeholder, children }) => (
  <Fragment>
    <div styleName="groupField" className={className}>
      <Input
        styleName="inputRoot"
        inputContainerClassName="inputContainer"
        valueLink={inputValueLink}
        type="number"
        pattern={isInteger ? '0-9' : '0-9.'}
        id={id}
        placeholder={placeholder}
        disabled={disabled}
      />
      {children}
    </div>
  </Fragment>
)

export default cssModules(Group, styles)
