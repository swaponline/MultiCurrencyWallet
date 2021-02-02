// import firebase from 'firebase/app'
// import 'firebase/auth'
// import 'firebase/messaging'
// import 'firebase/firestore'

// import actions from 'redux/actions'
// import moment from 'moment/moment'

// import fbHelper from './index'

// import appConfig from 'app-config'


// const isWidgetBuild = appConfig && appConfig.isWidget

// const addData = (collection, doc, data) => {
//   if (typeof collection !== 'string' || typeof doc !== 'string') {
//     console.error('Collection and document instance must be a string')
//     return
//   }
//   if (typeof data !== 'object') {
//     console.error('Data instance must be an object')
//     return
//   }
//   if (
//     navigator.userAgent.includes('monitor') ||
//     navigator.userAgent.includes('robot') ||
//     window.location.host === 'swaponline.github.io'
//   ) {
//     console.error('This is a bot, we are not intrested in this user')
//     return
//   }

//   return new Promise(async (resolve) => {
//     try {
//       const db = firebase.firestore(window.firebaseDefaultInstance)
//       db.collection(collection).doc(doc).set(data)
//         .then((docRef) => {
//           resolve(docRef)
//         })
//         .catch((e) => console.error('Promise add data error: ', e))

//     } catch (error) {
//       console.error('Add data to firestore error: ', error)
//     }
//   })
// }

// const updateData = (collection, doc, data) => {
//   if (typeof collection !== 'string' || typeof doc !== 'string') {
//     console.error('Collection and document instance must be a string')
//     return
//   }
//   if (typeof data !== 'object') {
//     console.error('Data instance must be an object')
//     return
//   }
//   if (
//     navigator.userAgent.includes('monitor') ||
//     navigator.userAgent.includes('robot') ||
//     window.location.host === 'swaponline.github.io'
//   ) {
//     console.error('This is a bot, we are not intrested in this user')
//     return
//   }

//   return new Promise(async (resolve) => {
//     try {
//       const db = firebase.firestore(window.firebaseDefaultInstance)
//       db.collection(collection).doc(doc).update(data)
//         .then((docRef) => {
//           resolve(docRef)
//         })
//         .catch((e) => {
//           if (e.message.includes('No document to update')) {
//             console.warn('Promise update data error. Trying to add new document.', e)
//             addData(collection, doc, data)
//             return
//           }
//           console.error('Promise update data error: ', e)
//         })

//     } catch (error) {
//       console.error('Update data to firestore error: ', error)
//     }
//   })
// }

// const addUser = (userData) =>
//   new Promise(async (resolve) => {
//     try {
//       const userID = await fbHelper.getUserID()
//       const date = moment().format('HH:mm:ss DD/MM/YYYY')
//       const unixDate = moment().unix()
//       const gaID = actions.analytics.getClientId() || 'None'

//       const data = {
//         ...userData,
//         id: userID,
//         date,
//         unixDate,
//         gaID,
//       }

//       if (userID) {
//         await addData('users', userID, data)
//       }

//       resolve(data)

//     } catch (error) {
//       console.error('Add user to firestore error: ', error)
//     }
//   })

// const submitCustomUserData = (collection, userData) => {
//   if (typeof collection !== 'string') {
//     console.error('Collection instance must be a string')
//     return
//   }

//   return new Promise(async (resolve) => {
//     try {

//       const userID = await fbHelper.getUserID()
//       const date = moment().format('HH:mm:ss DD/MM/YYYY')
//       const unixDate = moment().unix()
//       const gaID = actions.analytics.getClientId() || 'None'

//       const data = {
//         ...userData,
//         id: userID,
//         date,
//         unixDate,
//         gaID,
//       }

//       if (userID) {
//         await addData(collection, userID, data)
//       }

//       resolve(data)

//     } catch (error) {
//       console.error('Add user to firestore error: ', error)
//     }
//   })
// }

// const updateUserData = (userData) =>
//   new Promise(async (resolve) => {
//     try {

//       const userID = await fbHelper.getUserID()
//       const gaID = actions.analytics.getClientId() || 'None'

//       const data = {
//         ...userData,
//         id: userID,
//         gaID,
//       }

//       if (userID) {
//         const res = await updateData('users', userID, data)
//         resolve(res)
//       }

//     } catch (error) {
//       console.error('Add user to firestore error: ', error)
//     }
//   })

// const signUpWithPush = () =>
//   new Promise(async resolve => {
//     const messagingToken = await fbHelper.askPermission()

//     if (!messagingToken) {
//       resolve(messagingToken)
//       return
//     }

//     console.log('firebase messagingToken: ', messagingToken)

//     actions.user.addMessagingToken(messagingToken)

//     const sendResult = await updateUserData({
//       messagingToken,
//     })

//     if (sendResult) {
//       actions.analytics.signUpEvent({ action: 'signed', type: 'push' })
//     }
//     resolve(messagingToken)
//   })

// const signUpWithEmail = (subscriptionData) =>
//   new Promise(async resolve => {
//     const sendResult = await updateUserData(subscriptionData)

//     if (sendResult) {
//       actions.firebase.setSigned()
//       actions.analytics.signUpEvent({ action: 'signed', type: 'email' })
//     }
//     resolve(sendResult)
//   })

// export default {
//   addData,
//   updateData,
//   addUser,
//   submitCustomUserData,
//   updateUserData,
//   signUpWithPush,
//   signUpWithEmail,
// }
