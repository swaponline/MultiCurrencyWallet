import React from 'react'
import CSSModules from 'react-css-modules'

import { FormattedMessage } from 'react-intl'

import styles from './styles.scss'


const FilterForm = ({ filterValue, onSubmit, onChange, resetFilter }) => {
  return (
    <form styleName="filterForm" onSubmit={onSubmit} >
      <input placeholder="Search" value={filterValue} type="text" onChange={onChange} />
      <div styleName="buttons">
        <button styleName="show" onClick={onSubmit}>
          <FormattedMessage id="FilterTextFind" defaultMessage="Найти" />
        </button>
        <button styleName={`all ${filterValue ? 'active' : ''}`} onClick={resetFilter}>
          <FormattedMessage id="FilterTextAll" defaultMessage="Все" />
        </button>
      </div>
    </form>
  )
}

export default CSSModules(FilterForm, styles, { allowMultiple: true })