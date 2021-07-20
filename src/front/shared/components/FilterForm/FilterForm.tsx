import React from 'react'
import CSSModules from 'react-css-modules'
import { FormattedMessage } from 'react-intl'
import styles from './styles.scss'


const FilterForm = ({ filterValue, onSubmit, onChange, resetFilter }) => {

  const handleSubmit = e => {
    e.preventDefault()

    onSubmit()
  }

  const handleResetFilter = e => {
    e.preventDefault()
    e.stopPropagation()

    resetFilter()
  }

  return (
    <form styleName="filterForm" onSubmit={handleSubmit} >
      <input placeholder="Search" value={filterValue} type="text" onChange={onChange} />
      <div styleName="buttons">
        <button styleName="show" onClick={handleSubmit} type="button">
          <FormattedMessage id="FilterTextFind" defaultMessage="Find" />
        </button>
        <button styleName={`all ${filterValue ? 'active' : ''}`} onClick={handleResetFilter} type="button">
          <FormattedMessage id="FilterTextAll" defaultMessage="All" />
        </button>
      </div>
    </form>
  )
}

export default CSSModules(FilterForm, styles, { allowMultiple: true })
