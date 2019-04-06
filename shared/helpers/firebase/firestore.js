import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/messaging'
import 'firebase/firestore'

import actions from 'redux/actions'
import moment from 'moment/moment'

import fbHelper from './index'

import appConfig from 'app-config'


const isWidgetBuild = appConfig && appConfig.isWidget

const addData = (collection, doc, data) => {
  if (typeof collection !== 'string' || typeof doc !== 'string') {
    console.error('Collection and document instance must be a string')
    return
  }
  if (typeof data !== 'object') {
    console.error('Data instance must be an object')
    return
  }

  return new Promise(async (resolve) => {
    try {

      const db = firebase.firestore(window.firebaseDefaultInstance)
      db.collection(collection).doc(doc).set(data)
        .then((docRef) => {
          resolve(docRef)
        })

    } catch (error) {
      console.error('Add data to firestore error: ', error)
    }
  })
}

const updateData = (collection, doc, data) => {
  if (typeof collection !== 'string' || typeof doc !== 'string') {
    console.error('Collection and document instance must be a string')
    return
  }
  if (typeof data !== 'object') {
    console.error('Data instance must be an object')
    return
  }

  return new Promise(async (resolve) => {
    try {

      const db = firebase.firestore(window.firebaseDefaultInstance)
      db.collection(collection).doc(doc).update(data)
        .then((docRef) => {
          resolve(docRef)
        })

    } catch (error) {
      console.error('Update data to firestore error: ', error)
    }
  })
}

const addUser = (userData) =>
  new Promise(async (resolve) => {
    try {

      const userID = await fbHelper.getUserID()
      const date = moment().format('HH:mm:ss DD/MM/YYYY')
      const gaID = actions.analytics.getClientId() || 'None'

      const data = {
        ...userData,
        userID,
        date,
        gaID,
      }

      if (userID) {
        await addData('users', userID, data)
      }

      resolve(data)

    } catch (error) {
      console.error('Add user to firestore error: ', error)
    }
  })

const submitCustomUserData = (collection, userData) => {
  if (typeof collection !== 'string') {
    console.error('Collection instance must be a string')
    return
  }

  return new Promise(async (resolve) => {
    try {

      const userID = await fbHelper.getUserID()
      const date = moment().format('HH:mm:ss DD/MM/YYYY')
      const gaID = actions.analytics.getClientId() || 'None'

      const data = {
        ...userData,
        userID,
        date,
        gaID,
      }

      if (userID) {
        await addData(collection, userID, data)
      }

      resolve(data)

    } catch (error) {
      console.error('Add user to firestore error: ', error)
    }
  })
}

const updateUserData = (userData) =>
  new Promise(async (resolve) => {
    try {

      const userID = await fbHelper.getUserID()
      const date = moment().format('HH:mm:ss DD/MM/YYYY')
      const gaID = actions.analytics.getClientId() || 'None'

      if (userID) {
        const data = {
          ...userData,
          userID,
          date,
          gaID,
        }
        const addUser = await updateData('users', userID, data)
      }

    } catch (error) {
      console.error('Add user to firestore error: ', error)
    }
  })

const signUpWithPush = () =>
  new Promise(async resolve => {
    const messagingToken = await fbHelper.askPermission()

    if (!messagingToken) {
      resolve(messagingToken)
      return
    }

    console.log('firebase messagingToken: ', messagingToken)

    const sendResult = updateUserData({
      messagingToken,
    })

    if (sendResult) {
      actions.firebase.setSigned()
      actions.analytics.signUpEvent({ action: 'signed', type: 'push' })
    }
    resolve(sendResult)
  })

const signUpWithEmail = (subscriptionData) =>
  new Promise(async resolve => {
    const sendResult = updateUserData(subscriptionData)

    if (sendResult) {
      actions.firebase.setSigned()
      actions.analytics.signUpEvent({ action: 'signed', type: 'email' })
    }
    resolve(sendResult)
  })

export default {
  addData,
  updateData,
  addUser,
  submitCustomUserData,
  updateUserData,
  signUpWithPush,
  signUpWithEmail,
}
