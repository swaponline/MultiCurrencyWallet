import React from 'react'
import CSSModules from 'react-css-modules'
import styles from './FilterLink.scss'

type ComponentProps = {
  name: string
  filter: string
  onClick: () => void
}

const FilterLink = (props: ComponentProps) => {
  const { name, filter, onClick } = props

  return (
    <span
      styleName={filter === name.toLowerCase() ? 'item  active' : 'item'}
      onClick={onClick}
    >
      {name}
    </span>
  )
}

export default CSSModules(FilterLink, styles, { allowMultiple: true })
