import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/messaging'
import 'firebase/database'
import { config } from './config/firebase'

import actions from 'redux/actions'


const authorisation = () =>
  new Promise((resolve) =>
    firebase.auth().signInAnonymously()
      .then(() => firebase.auth().onAuthStateChanged((user) => resolve(user)))
      .catch((error) => console.log(`Can't sign in: `, error))
  )

const getIP = () =>
  new Promise(async (resolve) => {
    const ipRequire = await fetch('https://ipinfo.io/json', {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
      },
    })
    const ipResponse = await ipRequire.json()
    resolve(ipResponse)
  })

const sendData = (userId, dataBasePath, data) =>
  new Promise(async (resolve) => {
    const database = firebase.database()
    const usersRef = database.ref(dataBasePath)

    usersRef.child(userId).set(data)
      .then(() => resolve(true))
      .catch((error) => console.log('Send error: ', error))
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
    const ipInfo = await getIP()

    if (userID) {
      console.log('Got user ID: ', userID)

      const defaultData = {
        ip: ipInfo.ip,
        locale: ipInfo.country === 'NO' ? 'EN' : ipInfo.country,
      }

      const sendResult = await sendData(userID, dataBasePath, {
        ...defaultData,
        ...data,
      })
      resolve(sendResult)
    }
  })

const subscribe = (data = {}) =>
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
  initialize,
  subscribe,
  submitUserData,
  isSupported,
}
