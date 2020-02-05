import React, { Component } from 'react'
import { Modal } from 'components/modal'
import styles from './Share.scss'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import cssModules from 'react-css-modules'


@injectIntl
@cssModules(styles, { allowMultiple: true })

export default class Share extends Component {

  componentDidMount = () => {
    const { props: { data: { link, title } } } = this

    if (navigator.share) {

      navigator.share({
        title: title,
        url: link
      }).catch(console.error);
    }

  }

  render() {
    const { props: { data: { link } } } = this

    let name = 'ShareModal';
    let title = 'Share';
    
    return (
      <Modal name={name} title={title} >
        <span styleName="targets">
          <a styleName="button">
            <i styleName="icon" className="fab fa-facebook" />
            <span>Facebook</span>
          </a>
          <a styleName="button">
            <i styleName="icon" className="fab fa-twitter" />
            <span>Twitter</span>
          </a>
          <a styleName="button">
            <i styleName="icon" className="fab fa-linkedin" />
            <span>LinkedIn</span>
          </a>
          <a styleName="button">
            <i styleName="icon" className="fas fa-envelope" />
            <span>Email</span>
          </a>
        </span>
        <div styleName="link">
          <div styleName="pen-url">{link}</div>
          <button styleName="copy-link">
            <FormattedMessage
              id="ShareModal1"
              defaultMessage="Copy Link"
            />
          </button>
        </div>
      </Modal>
    )
  }
}