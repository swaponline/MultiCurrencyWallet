const getComment = (key) => getComments()[key] || undefined;

const setComment = ({ comment, key }) => {
  const historyComments = getComments()
  const newComment = { [`${key}`]: comment }
  console.log('newComment', { comment, key })

  localStorage.setItem('historyComments', JSON.stringify(
    {
      ...historyComments,
      ...newComment,
    },
  ))
}

const getComments = () => JSON.parse(localStorage.getItem('historyComments')) || {}

const returnDefaultComment = (hiddenList, ind) => {
  const newData = hiddenList ? hiddenList[ind] || '' : ''

  return newData
}

export default {
  getComment,
  returnDefaultComment,
  setComment
}
