// if (typeof importScripts === 'function') {
//   importScripts('https://www.gstatic.com/firebasejs/5.5.9/firebase-app.js')
//   importScripts('https://www.gstatic.com/firebasejs/5.5.9/firebase-messaging.js')

//   firebase.initializeApp({
//     messagingSenderId: '681929431956',
//   })

//   const messaging = firebase.messaging()

//   importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js')

//   if (workbox) {
//     console.log(`Workbox is loaded!`)

//     workbox.routing.registerRoute(
//       /\.js$/,
//       new workbox.strategies.NetworkFirst()
//     );

//   } else {
//     console.error(`Workbox didn't load!`)
//   }
// }