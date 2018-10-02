import React from 'react'
import PropTypes from 'prop-types'
import cssModules from 'react-css-modules'
import cx from 'classnames'

import styles from './FaqExpandableItem.scss'


@cssModules(styles, { allowMultiple: true })
export class FaqExpandableItem extends React.Component {

  static propTypes = {
    question: PropTypes.string.isRequired,
    answer: PropTypes.string.isRequired,
  }

  state = {
    expanded: false,
  }

  toggle = () => {
    this.setState({ expanded: !this.state.expanded })
  }

  render() {
    const { answer, question } = this.props
    const { expanded } = this.state

    const styleName = cx('container', {
      'active': expanded,
    })

    return (
      <div styleName={styleName}>
        <div styleName="header" onClick={this.toggle}>
          <div dangerouslySetInnerHTML={{ __html: question }} />
          <span className={`fas fa-${expanded ? 'minus' : 'plus'}`} styleName="icon" />
        </div>
        {
          expanded && <div styleName="description" dangerouslySetInnerHTML={{ __html: answer }} />
        }
      </div>
    )
  }
}
