import React from 'react'
import CSSModules from 'react-css-modules'
import styles from './LocalStorage.scss'
import { constants } from 'helpers'
import { isMobile } from 'react-device-detect'

const isDark = localStorage.getItem(constants.localStorage.isDark)

function LocalStorage() {
  return (
    <section styleName={`localStorage ${isDark ? 'dark' : ''}`}>
      <ul styleName='localStorage__list'>
        {
          Object.keys(window.localStorage).map((key, index) => {
            const privateKeyRegExp = /(mnemonic|private)/i;

            if (key !== 'redux-store' && key.match(privateKeyRegExp) === null) {
              return (
                <li key={index} styleName='localStorage__item'>
                  <span>{key}:</span> {window.localStorage[key]}
                </li>
              )
            }
          })
        }
      </ul>
    </section>
  )
}

export default CSSModules(LocalStorage, styles)