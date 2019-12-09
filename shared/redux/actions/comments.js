const getComment = () => localStorage.getItem('historyComments')
const setComment = (comment) => localStorage.setItem('historyComments', JSON.stringify(comment))

const returnDefaultComment = (hiddenList, ind) => {
  const newData = hiddenList ? hiddenList[ind] || '' : ''

  return newData
}

export default {
  getComment,
  returnDefaultComment,
  setComment,
}

