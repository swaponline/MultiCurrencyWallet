import React from "react"

import { FormattedMessage } from 'react-intl'

import cssModules from 'react-css-modules'
import moment from 'moment-with-locales-es6'
import actions from 'redux/actions'

import styles from './Row.scss'


const submitComment = (e, props) => {
  const { comment, toggleComment, onSubmit, hiddenList, ind } = props
  e.preventDefault()

  const comments = { ...hiddenList, [ind]: comment }

  onSubmit(comments)
  toggleComment(false)
}

const CommentRow = (props) => {
  const { comment, toggleComment, changeComment, date, isOpen, commentCancel } = props
  return isOpen ?
    <form styleName="input" onSubmit={(e) => submitComment(e, props)}>
      <input type="text" defaultValue={comment || moment(date).format('LLLL')} onChange={changeComment} />
      <span styleName="green" onClick={(e) => submitComment(e, props)}>&#10004;</span>
      <span onClick={commentCancel}>&times;</span>
    </form> :
    <div styleName="date" onDoubleClick={() => toggleComment(true)}>{comment || moment(date).format('LLLL')}</div>
}

export default cssModules(CommentRow, styles, { allowMultiple: true })
