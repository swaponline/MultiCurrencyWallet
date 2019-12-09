const getComment = () => localStorage.getItem('historyComments')
const setComment = (comment) => localStorage.setItem('historyComments', JSON.stringify(comment))

const returnDefaultComment = (hash, type) => {
  let comment = getComment()
  if (comment) {
    comment = JSON.parse(comment)
  }
  const newData = comment ? comment[`${hash}-${type}`] || '' : ''

  return newData
}

const commentCancel = (hash, date, type, commentDate) => {
  let comment = getComment()
  if (comment) {
    comment = { ...JSON.parse(comment), [`${hash}-${type}`]: commentDate }
    setComment(comment)
  }
}

export default {
  getComment,
  returnDefaultComment,
  commentCancel,
  setComment,
}

