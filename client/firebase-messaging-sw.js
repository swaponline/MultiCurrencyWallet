if( 'function' === typeof importScripts) {
  importScripts('https://www.gstatic.com/firebasejs/5.5.9/firebase-app.js')
  importScripts('https://www.gstatic.com/firebasejs/5.5.9/firebase-messaging.js')

  firebase.initializeApp({
    messagingSenderId: '681929431956',
  })

  const messaging = firebase.messaging()

  importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js')

  if (workbox) {
    console.log(`Yay! Workbox is loaded 🎉`)

    workbox.routing.registerRoute(
      /\.js$/,
      new workbox.strategies.NetworkFirst()
    );

    const appInstalled = (e) => {
      const userLanguage = (navigator.userLanguage || navigator.language || "en-gb").split("-")[0]

      alert(
        userLanguage === 'ru'
          ? 'Подождите пока приложение устанавливается'
          : 'Wait while application is installing'
      )
      window.removeEventListener('appinstalled', appInstalled)
    }
    window.addEventListener('appinstalled', appInstalled)
  } else {
    console.log(`Boo! Workbox didn't load 😬`)
  }
}