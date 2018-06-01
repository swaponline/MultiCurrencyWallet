import React from 'react'

import cssModules from 'react-css-modules'
import { generate } from 'shortid'

import styles from './Table.scss'


const Table = ({ titles, rows, rowRender }) => (
  <table styleName="table">
    <thead>
      <tr>
        {
          titles.map((title, index) => (
            <th key={generate()}>{title}</th>
          ))
        }
      </tr>
    </thead>
    <tbody>
      {
        rows.map((row, rowIndex) => {
          if (typeof rowRender === 'function') {
            return rowRender(row, rowIndex)
          }
        })
      }
    </tbody>
  </table>
)


export default cssModules(Table, styles)
