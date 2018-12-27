import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/messaging'
import 'firebase/database'
import { config } from './config/firebase'

import actions from 'redux/actions'
import { request } from 'helpers'
import reducers from 'redux/core/reducers'


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
      .catch((error) => console.log(error))
  })

const initialize = () => {
  if (!firebase.apps.length && 'serviceWorker' in navigator) {
    firebase.initializeApp(config)

    navigator.serviceWorker
      .register('firebase-messaging-sw.js', { scope: './' })
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

    if (userID) {
      console.log('Got user ID: ', userID)

      const sendResult = await sendData(userID, dataBasePath, {
        ...ipInfo,
        ...data,
      })
      resolve(sendResult)
    }
  })

const signUpFirebase = (data) =>
  new Promise(async resolve => {
    const dataBasePath = 'usersSubscribed'
    const messagingToken = await askPermission()
    let sendResult = false

    if (messagingToken) {
      console.log('Have notifications permissions')
      console.log('Got messaging token: ', messagingToken)

      sendResult = submitUserData(dataBasePath, { messagingToken, ...data })
      resolve(sendResult)
    }
  })

const signUpServer = (data) =>
  new Promise(async (resolve) => {
    try {
      const result = await request.post('https://swap.wpmix.net/push2/', data)
      resolve(result.result === 'ok')
    } catch (error) {
      resolve(false)
    }
  })

const signUp = (data = {}) =>
  new Promise(async resolve => {
    let result = false

    if (isSupported()) {
      result = await signUpFirebase(data)
    } else {
      result = await signUpServer(data)
    }
    reducers.signUp.setSigned()
    resolve(result)
  })

const isSupported = () => {
  const isLocalNet = process.env.LOCAL === 'local'
  const isSupportedServiceWorker = 'serviceWorker' in navigator
  const iOSSafari = /iP(ad|od|hone)/i.test(window.navigator.userAgent)
                  && /WebKit/i.test(window.navigator.userAgent)
                  && !(/(CriOS|FxiOS|OPiOS|mercury)/i.test(window.navigator.userAgent))
  const isSafari = ('safari' in window)

  return !isLocalNet && isSupportedServiceWorker && !iOSSafari && !isSafari
}

export default {
  getIPInfo,
  initialize,
  signUp,
  submitUserData,
  isSupported,
}
