import React from 'react'

import { constants } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './Table.scss'

import { FormattedMessage } from 'react-intl'


const isDark = localStorage.getItem(constants.localStorage.isDark)
@CSSModules(styles, { allowMultiple: true })
export default class Table extends React.Component {

  constructor() {
    super()

    this.state = {
      selectId: 0,
    }
  }

  componentDidMount() {
    if (this.props.id === 'table-wallet') {
      window.addEventListener('resize', this.handleResponsiveTable)
      this.handleResponsiveTable()
    }
  }

  componentWillUnmount() {
    if (this.props.id === 'table-wallet') {
      window.removeEventListener('resize', this.handleResponsiveTable)
    }
  }

  handleSelectId = (id) => {
    this.setState(() => ({ selectId: id }))
  }

  handleResponsiveTable = () => {
    const { linkOnTableBody: tdLink, linkOnTableHead: thLink } = this

    let th = thLink.children[0].cells
    let td = tdLink.children[0].cells

    for (let i = 0; i < th.length; i++) {
      th[i].style.width = `${td[i].offsetWidth}px`
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { rows, isLoading } = this.props
    return isLoading !== nextProps.isLoading || rows !== nextProps.rows || this.state.selectId !== nextState.selectId
  }

  render() {
    const { titles, rows, rowRender, textIfEmpty, isLoading, loadingText, className } = this.props

    return (
      <table styleName={`table ${isDark ? '--dark' : ''}`} className={className} ref={(table) => this.linkOnTable = table}>
        <thead ref={(thead) => this.linkOnTableHead = thead}>
          <tr>
            {
              titles.filter(title => !!title).map((title, index) => (
                <th key={index}>{title}</th>
              ))
            }
          </tr>
        </thead>
        <tbody ref={(tbody) => this.linkOnTableBody = tbody}>
          {
            isLoading && (
              <tr>
                <td styleName="color">{loadingText}</td>
              </tr>
            )
          }
          {
            !isLoading && !rows.length && (
              <tr>
                <td styleName="color">{textIfEmpty}</td>
              </tr>
            )
          }
          {
            !isLoading && !!rows.length && rows.map((row, rowIndex) => {
              if (typeof rowRender === 'function') {
                return rowRender(row, rowIndex, this.state.selectId, this.handleSelectId)
              }
            })
          }
        </tbody>
      </table>
    )
  }
}

Table.defaultProps = {
  textIfEmpty: <FormattedMessage id="Table95" defaultMessage="The table is empty" />,
  loadingText: <FormattedMessage id="Table96" defaultMessage="Loading..." />,
  titles: []
}
