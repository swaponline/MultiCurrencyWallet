let storageComments = JSON.parse(localStorage.getItem('historyComments'))
const getComment = () => storageComments
const setComment = (comment) => {
  const newComment = JSON.stringify(comment)
  storageComments = comment
  localStorage.setItem('historyComments', newComment)
}

const returnDefaultComment = (hiddenList, ind) => {
  const newData = hiddenList ? hiddenList[ind] || '' : ''

  return newData
}

export default {
  getComment,
  returnDefaultComment,
  setComment,
}

