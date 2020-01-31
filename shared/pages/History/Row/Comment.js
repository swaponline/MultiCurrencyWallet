import React from 'react'
import PropTypes from 'prop-types'

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

  const { comment, label, toggleComment, changeComment, date, isOpen, commentCancel } = props
  return isOpen ?
    <form styleName="input" onSubmit={(e) => submitComment(e, props)}>
      <textarea onChange={changeComment} >{comment || `${moment(date).format('LLLL')}  ${label}`}</textarea>
      <span styleName="submit" onClick={(e) => submitComment(e, props)}>&#10004;</span>
      <span styleName="close" onClick={commentCancel}>&times;</span>
    </form> :
    <div styleName="date" onDoubleClick={() => toggleComment(true)}>{comment || `${moment(date).format('LLLL')}  ${label}`}</div>
}


CommentRow.defaultProps = {
  label: '',
}

CommentRow.propTypes = {
  label: PropTypes.string.isRequired,
}

export default cssModules(CommentRow, styles, { allowMultiple: true })


