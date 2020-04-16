import React from 'react'
import PropTypes from 'prop-types'
import CSSModules from 'react-css-modules'


import styles from './Comment.scss'
import { connect } from 'redaction'
import { FormattedMessage, injectIntl } from 'react-intl'


@CSSModules(styles, { allowMultiple: true })

@connect(({
  history: {
    transactions
  },
}) => ({
  transactions
}))
export default class CommentRow extends React.Component {

  static propTypes = {
    label: PropTypes.string, // @Todo надо проверить что это такое
  };

  constructor(props) {
    const { ind } = props

    super(props)

    this.state = {
      isOpen: false,
      comment: null,
      ind
    }

    this.commentTextarea = React.createRef()
  }

  submitComment = (e, props) => {
    const { ind, comment } = this.state
    if (e) {
      e.preventDefault()
    }

    const comments = { [ind]: comment }
    console.log(comments)
    actions.comments.setComment(comments)

    this.toggleComment(false)
  }
  componentDidMount() {
    actions.user.setTransactions()
  }
  componentDidUpdate(prevProps) {

    if (this.props.isOpen && this.props.isOpen !== prevProps.isOpen && this.props.onSubmit) {
        this.handleKeyUp();
    }
  }

  changeComment = (val) => {

    this.setState(() => ({ comment: val }))
  }

  handleKeyUp = (e = null) => {
    if (!this.commentTextarea) {

      return
    }

    if (e && e.ctrlKey && e.keyCode == 13) {

      this.submitComment(null, this.props)
      return
    }

    this.commentTextarea
      .current.style.cssText = 'height:' + this.commentTextarea.current.scrollHeight + 'px;'
  }
  toggleComment = (isOpen) => {


    this.setState({
        isOpen: isOpen
      }
    );
  }

  render() {
    const {
      comment
       } = this.props

    const { isOpen } = this.state

    return <div styleName="date"
                onDoubleClick={() => this.toggleComment(true)}>
      <FormattedMessage id="Comment1" defaultMessage="Add notice" />
    </div>

  }
}


