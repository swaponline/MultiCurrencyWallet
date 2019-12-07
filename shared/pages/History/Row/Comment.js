import React from "react"

import cssModules from 'react-css-modules'
import { FormattedMessage } from 'react-intl'

import styles from './Row.scss'


const submitComment = ({ hash, comment, toggleComment }) => {
  let comments = localStorage.getItem('historyComments')
  if (comments) {
    comments = JSON.parse(comments)
  } else {
    comments = {}
  }
  comments[hash] = comment

  localStorage.setItem('historyComments', JSON.stringify(comments))
  toggleComment(false)
}

const CommentRow = (props) => {
  const { comment, commentCancel, changeComment } = props
  return (
    <tr styleName="addCommentRow">
      <td>
        <textarea defaultValue={comment} placeholder="Введите комментарий" onChange={changeComment} />
        <div>
          <button onClick={() => submitComment(props)}>
            <FormattedMessage id="submitComment" defaultMessage="Ok" />
          </button>
          <button onClick={commentCancel}>
            <FormattedMessage id="cancelComment" defaultMessage="Отменить" />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default cssModules(CommentRow, styles, { allowMultiple: true })
