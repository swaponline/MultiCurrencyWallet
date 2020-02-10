import React from 'react'
import PropTypes from 'prop-types'
import CSSModules from 'react-css-modules'
import moment from 'moment-with-locales-es6'
import styles from './Row.scss'


@CSSModules(styles, { allowMultiple: true })
export default class CommentRow extends React.Component {
  
  static propTypes = {
    // label: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props)
    this.commentTextarea = React.createRef()
  }

  submitComment = (e, props) => {
    const { comment, toggleComment, onSubmit, hiddenList, ind } = props
    if(e) {
      e.preventDefault()
    }
  
    const comments = { ...hiddenList, [ind]: comment }
  
    onSubmit(comments)
    toggleComment(false)
  }

  componentDidUpdate(prevProps) {
    
    if (this.props.isOpen && this.props.isOpen !== prevProps.isOpen) {
      this.handleKeyUp();
    }
  }

  handleKeyUp = (e=null) => {
    
    if(e && e.ctrlKey && e.keyCode == 13) {
      
      this.submitComment(null, this.props)
      return
    }
    this.commentTextarea
          .current.style.cssText = 'height:' + this.commentTextarea.current.scrollHeight + 'px;'  
  }

  render() {
    
    const { comment, label, toggleComment, changeComment, date, isOpen, commentCancel } = this.props
    return isOpen ?
      <form styleName="input" onSubmit={(e) => this.submitComment(e, this.props)}>
        <textarea ref={this.commentTextarea}  styleName="commentTextarea" id="commentTextarea" onKeyUp={this.handleKeyUp} onChange={changeComment} value={comment || `${moment(date).format('LLLL')}  ${label}`} ></textarea>
        <span styleName="submit" onClick={(e) => this.submitComment(e, this.props)}>&#10004;</span>
        <span styleName="close" onClick={commentCancel}>&times;</span>
      </form> :
      <div styleName="date" onDoubleClick={() => toggleComment(true)}>{comment || `${moment(date).format('LLLL')}  ${label}`}</div>

  }
}


