1. offline https://screenshots.wpmix.net/chrome_kggqZbdUH2Ch0CN5moJbreq8qaPQUruv.png . перезагрузить сигнальный сервер
2. запустить сервис pm2 start /root/webstar/server.sh
3. обновление
  cd ./webstar
  pm2 stop server
  npm i libp2p-webrtc-star@latest
  pm2 start server
4. проверка работы - перейти по ссылке http://webrtc-star-1.swaponline.io/
