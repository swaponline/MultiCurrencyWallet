if( 'function' === typeof importScripts) {
  importScripts('https://www.gstatic.com/firebasejs/5.5.9/firebase-app.js')
  importScripts('https://www.gstatic.com/firebasejs/5.5.9/firebase-messaging.js')

  firebase.initializeApp({
    messagingSenderId: '681929431956',
  })

  const messaging = firebase.messaging()
}
