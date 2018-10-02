import React from 'react'
import PropTypes from 'prop-types'
import cssModules from 'react-css-modules'
import cx from 'classnames'

import styles from './FaqExpandableItem.scss'

@cssModules(styles, { allowMultiple: true })
export class FaqExpandableItem extends React.Component {

  static propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }

  state = {
    expanded: false,
  }

  toggle = () => {
    this.setState({ expanded: !this.state.expanded })
  }

  render() {
    const { description, title } = this.props
    const { expanded } = this.state

    const styleName = cx('container', {
      'active': expanded,
    })

    return (
      <div styleName={styleName}>
        <div styleName="header" onClick={this.toggle}>
          {title}
          <span className={`fas fa-${expanded ? 'minus' : 'plus'}`} styleName="icon" />
        </div>
        {
          expanded && <div styleName="description">{description}</div>
        }
      </div>
    )
  }
}
