import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/messaging'
import 'firebase/database'
import 'firebase/firestore'
import { config } from './config/firebase'

import axios from 'axios'

import actions from 'redux/actions'
import { getState } from 'redux/core'
import moment from 'moment/moment'

import firestoreInstance from './firestore'

import clientConfig from './config/firebase-client-config'

import appConfig from 'app-config'


const isWidgetBuild = appConfig && appConfig.isWidget

const authorisation = () =>
  new Promise((resolve) =>
    firebase.auth().signInAnonymously()
      .then(() => firebase.auth().onAuthStateChanged((user) => resolve(user)))
      .catch((error) => console.log(`Can't sign in: `, error))
  )

const getIPInfo = () => {
  try {
    return axios
      .get('https://json.geoiplookup.io')
      .then((result) => {
        // eslint-disable-next-line camelcase
        const { ip, country_code } = result.data
        // eslint-disable-next-line camelcase
        if (!ip || !country_code) {
          return ({
            ip: 'json.geoiplookup.io didn\'t respond with a result, so setting locale EN by default',
            locale: 'EN',
          })
        }
        return ({
          ip,
          locale: country_code,
        })
      })
      .catch((error) => {
        console.error('getIPInfo:', error)

        return {
          ip: 'None',
          locale: 'EN',
        }
      })
  } catch (error) {
    console.error(error)
  }
  return {
    ip: 'None',
    locale: 'EN',
  }
}

const sendData = (userId, dataBasePath, data, isDefault = true) =>
  new Promise(async (resolve) => {
    const database = isDefault
      ? firebase.database()
      : firebase.database(window.clientDBinstance)

    const usersRef = database.ref(dataBasePath)

    usersRef.child(userId).set(data)
      .then(() => resolve(true))
      .catch((error) => {
        console.log('Send error: ', error)
        resolve(false)
      })
  })

const setUserLastOnline = async () => {
  const userID = await getUserID()
  const data = {
    lastOnline: moment().format('HH:mm:ss DD/MM/YYYY'),
    unixLastOnline: moment().unix(),
    lastUserAgent: navigator.userAgent,
    lastOnlineDomain: window.top.location.host,
  }

  sendData(userID, 'usersCommon', data)
  firestoreInstance.updateUserData(data)
}

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
  // window.clientDBinstance = firebase.initializeApp(clientConfig, 'widget-client')

  const firebaseApp = firebase.initializeApp(config)
  window.firebaseDefaultInstance = firebaseApp

  firebase.firestore(firebaseApp)

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

  try {
    const messaging = firebase.messaging()
    messaging.usePublicVapidKey('BLiLhKj7Re98YaB0IwfcUpwuYHqosbgjD0OGQojFW2rP5Vj_ncoAwa4NqQ1GQsVJ5EF53hL4u9D5ND_jRzRxhzI')
  } catch (error) {
    console.error('Error useVAPID: ', error)
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
    const date = moment().format('DD-MM-YYYY')
    const gaID = actions.analytics.getClientId() || 'None'

    if (userID) {
      const sendResult = await sendData(userID, dataBasePath, {
        date,
        gaID,
        ...data,
      })
      resolve(sendResult)
    }
  })

const submitUserDataWidget = async (dataBasePath = 'usersCommon') => {
  if (!isWidgetBuild) {
    return
  }
  const {
    user: {
      ethData,
      btcData,
      ghostData,
    },
  } = getState()

  const ethAddress = (ethData && ethData.address) ? ethData.address : ``
  const btcAddress = (btcData && btcData.address) ? btcData.address : ``
  const ghostAddress = (ghostData && ghostData.address) ? ghostData.address : ``

  return new Promise(async resolve => {
    const userID = await getUserID()
    const data = {
      ethAddress,
      btcAddress,
      ghostAddress,
    }
    const dataBasePathFormatted = `widgetUsers/${window.top.location.host}/${dataBasePath}`.replace(/[\.\#\$\[\]]/ig, '_') // eslint-disable-line

    if (userID) {
      const sendWidgetResultToDefaultDB = await sendData(userID, dataBasePathFormatted, data)
      // const sendResult = await sendData(userID, dataBasePath, data, false) // send to client's firebase

      resolve(sendWidgetResultToDefaultDB)
    }
  })
}

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
      actions.analytics.signUpEvent({ action: 'signed', type: 'push' })
    }
    resolve(sendResult)
  })

const signUpWithEmail = (data) =>
  new Promise(async resolve => {
    const dataBasePath = 'usersSubscribed/emailNotification'
    const sendResult = submitUserData(dataBasePath, data)

    if (sendResult) {
      actions.firebase.setSigned()
      actions.analytics.signUpEvent({ action: 'signed', type: 'email' })
    }
    resolve(sendResult)
  })

const checkIsIframe = () => {
  let currentWindow

  try {
    currentWindow = window.self !== window.top
  } catch (error) {
    currentWindow = true
  }

  return currentWindow
}

const isSupported = () => {
  const isLocalNet = process.env.LOCAL === 'local'
  const isSupportedServiceWorker = 'serviceWorker' in navigator
  const isSafari = ('safari' in window)
  const isIframe = checkIsIframe()
  const iOSSafari = /iP(ad|od|hone)/i.test(window.navigator.userAgent)
                  && /WebKit/i.test(window.navigator.userAgent)
                  && !(/(CriOS|FxiOS|OPiOS|mercury)/i.test(window.navigator.userAgent))

  return !isIframe && !isLocalNet && isSupportedServiceWorker && !iOSSafari && !isSafari
}

export default {
  getUserID,
  askPermission,
  getIPInfo,
  initialize,
  submitUserData,
  submitUserDataWidget,
  isSupported,
  signUpWithPush,
  signUpWithEmail,
  setUserLastOnline,
}
