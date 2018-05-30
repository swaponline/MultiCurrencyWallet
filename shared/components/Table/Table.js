import React from 'react'

import cssModules from 'react-css-modules'
import styles from './Table.scss'


const Table = ({ titles, rows, rowRender, cellRender, myPeer, activeOrderId }) => (
  <table styleName="table">
    <thead>
    <tr>
      {
        titles.map((title, index) => (
          <th key={index}>{title}</th>
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
        return (
          <tr key={rowIndex}>
            {
              [row].map(sellAmount => ({sellAmount}))
              .map((cell, colIndex) => {
                console.log(cell)
                return (
                  <td key={colIndex}>
                    {
                      typeof cellRender === 'function' ? (
                        cellRender(cell, colIndex)
                      ) : (
                        cell
                      )
                    }
                  </td>
                )
              })
            }
          </tr>
        )
      })
    }
    </tbody>
  </table>
)


export default cssModules(Table, styles)
