import React from 'react'

import cssModules from 'react-css-modules'
import moment from 'moment-with-locales-es6'
import actions from 'redux/actions'

import styles from './Row.scss'


const submitComment = (e, { hash, comment, toggleComment, type }) => {
  e.preventDefault()
  let comments = actions.comments.getComment()
  if (comments) {
    comments = JSON.parse(comments)
  } else {
    comments = {}
  }

  comments = { ...comments, [`${hash}-${type}`]: comment }
  actions.comments.setComment(comments)
  toggleComment(false)
}

const CommentRow = (props) => {
  const { comment, toggleComment, changeComment, date, isOpen, commentCancel } = props
  return isOpen ?
    <form styleName="input" onSubmit={(e) => submitComment(e, props)}>
      <input type="text" defaultValue={comment || moment(date).format('LLLL')} onChange={changeComment} />
      <span onClick={commentCancel}>&times;</span>
    </form> :
    <div styleName="date" onDoubleClick={() => toggleComment(true)}>{comment || moment(date).format('LLLL')}</div>
}

export default cssModules(CommentRow, styles, { allowMultiple: true })
