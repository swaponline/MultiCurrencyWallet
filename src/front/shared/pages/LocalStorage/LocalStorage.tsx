import React, { useState, useEffect, useRef } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import CSSModules from 'react-css-modules'
import styles from './LocalStorage.scss'
import { constants } from 'helpers'
import { FormattedMessage } from 'react-intl'
import request from '../../helpers/request'


const isDark = localStorage.getItem(constants.localStorage.isDark)

function LocalStorage() {
  const [localStorage, setLocalStorage] = useState(JSON.stringify({}))
  const textareaRef = useRef(null);

  const sendToDevelopers = () => {
    request.post(`https://noxon.wpmix.net/counter.php?todevs=1&msg=post`, {
      body: {
        data: localStorage,
      },
    }).then(res => console.log(res))
  }

  useEffect(() => {
    const newStorage = {}
    const privateDataRegExp = /(mnemonic|private|twentywords|backup|peeridjson)/i;

    for (let key in window.localStorage) {
      if (key !== 'redux-store' && key.match(privateDataRegExp) === null) {
        newStorage[key] = window.localStorage[key]
      }
    }

    setLocalStorage(JSON.stringify(newStorage))
  })

  return (
    <section styleName={`${isDark ? 'localStorageDark' : 'localStorage'}`}>
      <h3>
        <FormattedMessage
          id="localStorageUserNotification"
          defaultMessage="✔️ This data doesn't contain your private keys"
        />
      </h3>

      <div styleName='localStorage__buttons-container'>
        <button styleName='localStorage__btn' onClick={() => {
          document.location.href = '#/exchange'
        }}>
          <FormattedMessage
            id="localStorageBtnExchange"
            defaultMessage="Exchange"
          />
        </button>
        <CopyToClipboard text={localStorage} >
          <button styleName='localStorage__btn' onClick={() => textareaRef.current.select()}>
            <FormattedMessage
              id="localStorageBtnSend"
              defaultMessage="Copy"
            />
          </button>
        </CopyToClipboard>
        <button styleName='localStorage__btn' onClick={sendToDevelopers}>
            <FormattedMessage
              id="localStorageBtnSend"
              defaultMessage="Send to developers"
            />
        </button>
      </div>


      <textarea styleName='localStorage__textarea' 
        ref={textareaRef}
        value={localStorage}
        readOnly
      />
    </section>
  )
}

export default CSSModules(LocalStorage, styles)