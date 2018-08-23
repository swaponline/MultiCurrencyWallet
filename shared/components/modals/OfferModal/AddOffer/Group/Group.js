import React, { Fragment } from 'react'

import styles from './Group.scss'
import cssModules from 'react-css-modules'

import Input from 'components/forms/Input/Input'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'


const Group = ({ className, label, id, inputValueLink, placeholder, children }) => (
  <Fragment>
    <FieldLabel inRow>{label}</FieldLabel>
    <div styleName="groupField" className={className}>
      <Input
        styleName="inputRoot"
        inputContainerClassName="inputContainer"
        valueLink={inputValueLink}
        pattern="0-9\."
        id={id}
        placeholder={placeholder}
      />
      {children}
    </div>
  </Fragment>
)

export default cssModules(Group, styles)

