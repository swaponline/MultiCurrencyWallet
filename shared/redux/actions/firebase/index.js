import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/messaging'
import 'firebase/database'
import { config } from './config/firebase'

import actions from 'redux/actions'
import reducers from 'redux/core/reducers'
import { request } from 'helpers'
import moment from 'moment/moment'


const authorisation = () =>
  new Promise((resolve) =>
    firebase.auth().signInAnonymously()
      .then(() => firebase.auth().onAuthStateChanged((user) => resolve(user)))
      .catch((error) => console.log(`Can't sign in: `, error))
  )

const getIPInfo = () =>
  new Promise(async (resolve) => {
    const ipResponse = await request.get('https://ipinfo.io/json')

    const resultData = {
      ip: ipResponse.ip,
      locale: ipResponse.country === 'NO' ? 'EN' : ipResponse.country,
    }
    resolve(resultData)
  })

const sendData = (userId, dataBasePath, data) =>
  new Promise(async (resolve) => {
    const database = firebase.database()
    const usersRef = database.ref(dataBasePath)

    usersRef.child(userId).set(data)
      .then(() => resolve(true))
      .catch((error) => {
        console.log('Send error: ', error)
        resolve(false)
      })
  })

const askPermission = () =>
  new Promise(async (resolve) => {
    const messaging = firebase.messaging()

    await messaging.requestPermission()
      .then(() => messaging.getToken())
      .then((token) => resolve(token))
      .catch((error) => {
        console.log(error)
        resolve(false)
      })
  })

const initialize = () => {
  firebase.initializeApp(config)

  if (isSupported()) {
    navigator.serviceWorker
      .register('/firebase-messaging-sw.js')
      .then((registration) => firebase.messaging().useServiceWorker(registration))

    const messaging = firebase.messaging()

    messaging.onMessage((payload) => {
      console.log('Message received. ', payload)
      const message = payload.notification.body
      actions.notifications.show('Message', { message })
    })
  }
}

const getUserID = () =>
  new Promise(async resolve => {
    const storageName = 'firebaseUserId'
    let userID = localStorage.getItem(storageName)
    let user = {}

    if (userID === null) {
      user = await authorisation()
      userID = user.uid
      localStorage.setItem(storageName, userID)
    }
    resolve(userID)
  })

const submitUserData = (dataBasePath = 'usersCommon', data = {}) =>
  new Promise(async resolve => {
    const userID = await getUserID()
    const ipInfo = await getIPInfo()
    const date = moment().format('DD-MM-YYYY')
    const gaID = actions.analytics.getClientId() || 'None'

    if (userID) {
      const sendResult = await sendData(userID, dataBasePath, {
        date,
        gaID,
        ...ipInfo,
        ...data,
      })
      resolve(sendResult)
    }
  })

const signUpWithPush = (data) =>
  new Promise(async resolve => {
    const dataBasePath = 'usersSubscribed/pushNotification'
    const messagingToken = await askPermission()

    if (!messagingToken) {
      resolve(messagingToken)
      return
    }

    console.log('firebase messagingToken: ', messagingToken)

    const sendResult = submitUserData(dataBasePath, {
      ...data,
      messagingToken,
    })

    if (sendResult) {
      reducers.signUp.setSigned()
      actions.analytics.signUpEvent({ action: 'signed', type: 'push' })
    }
    resolve(sendResult)
  })

const signUpWithEmail = (data) =>
  new Promise(async resolve => {
    const dataBasePath = 'usersSubscribed/emailNotification'
    const sendResult = submitUserData(dataBasePath, data)

    if (sendResult) {
      reducers.signUp.setSigned()
      actions.analytics.signUpEvent({ action: 'signed', type: 'email' })
    }
    resolve(sendResult)
  })

const isSupported = () => {
  const isLocalNet = process.env.LOCAL === 'local'
  const isSupportedServiceWorker = 'serviceWorker' in navigator
  const isSafari = ('safari' in window)
  const iOSSafari = /iP(ad|od|hone)/i.test(window.navigator.userAgent)
                  && /WebKit/i.test(window.navigator.userAgent)
                  && !(/(CriOS|FxiOS|OPiOS|mercury)/i.test(window.navigator.userAgent))

  return !isLocalNet && isSupportedServiceWorker && !iOSSafari && !isSafari
}

export default {
  getIPInfo,
  initialize,
  submitUserData,
  isSupported,
  signUpWithPush,
  signUpWithEmail,
}
