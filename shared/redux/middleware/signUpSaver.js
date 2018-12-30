const signUpSaver = store => next => action => {
  if (action.type === 'signUp.setSigned') {
    localStorage['redux-store'] = JSON.stringify({ signUp: store.getState().signUp })
  }
  return next(action)
}

export {
  signUpSaver,
}
