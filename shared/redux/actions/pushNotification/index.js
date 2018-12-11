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

const sendData = (userId, data) =>
  new Promise(async (resolve) => {
    const database = firebase.database()
    const usersRef = database.ref('users')

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

const initializeFirebase = () => {
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

const registrationFirebase = (data = {}) =>
  new Promise(async (resolve) => {
    const user = await authorisation()
    const ipInfo = await getIP()

    let token = null
    let sendResult = false

    if (user) {
      console.log('Got user ID: ', user.uid)
      token = await askPermission()
      if (token) {
        console.log('Have notifications permissions')
        console.log('Got token: ', token)
        sendResult = await sendData(user.uid, {
          token,
          ip: ipInfo.ip,
          locale: ipInfo.country === 'NO' ? 'EN' : ipInfo.country,
          ...data,
        })
        resolve(sendResult)
      }
    }
  })

export default {
  initializeFirebase,
  registrationFirebase,
}
