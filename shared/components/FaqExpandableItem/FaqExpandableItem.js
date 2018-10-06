import React from 'react'
import PropTypes from 'prop-types'
import cssModules from 'react-css-modules'

import styles from './FaqExpandableItem.scss'


@cssModules(styles)
export class FaqExpandableItem extends React.PureComponent {

  static propTypes = {
    question: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    // answer: PropTypes.string.isRequired,
  }

  // state = {
  //   expanded: false,
  // }

  // toggle = () => {
  //   this.setState({ expanded: !this.state.expanded })
  // }

  render() {
    const { question } = this.props
    // const { expanded } = this.state

    // const styleName = cx('container', {
    //   'active': expanded,
    // })

    return (
      <div styleName="container">
        <div styleName="header" onClick={this.goToLink}>
          {question}
          {/* <span className={`fas fa-${expanded ? 'minus' : 'plus'}`} styleName="icon" /> */}
        </div>
        {/* { */}
        {/* expanded && <div styleName="description" dangerouslySetInnerHTML={{ __html: answer }} /> */}
        {/* } */}
      </div>
    )
  }

  goToLink = () => {
    window.open(this.props.link)
  }
}
