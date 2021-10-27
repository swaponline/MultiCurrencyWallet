import actions from 'redux/actions/index'
import { connect } from 'redaction'

import CSSModules from 'react-css-modules'
import styles from './Filter.scss'

import FilterLink from './FilterLink/FilterLink'

type ComponentProps = {
  filter: string
}

const filters = ['All', 'Sent', 'Received']

const Filter = (props: ComponentProps) => {
  const { filter } = props

  const handleChangeFilter = (filter) => {
    actions.filter.setFilter(filter)
  }

  return (
    <div styleName="filter">
      {
        filters.map((item, index) => (
          <FilterLink
            key={index}
            name={item}
            onClick={() => handleChangeFilter(item.toLowerCase())}
            filter={filter}
          />
        ))
      }
    </div>
  )
}

export default connect(({ history: { filter } }) => ({
  filter,
}))(CSSModules(Filter, styles))
