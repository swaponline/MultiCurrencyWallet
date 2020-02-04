import React, { Component } from 'react'
import { Modal } from 'components/modal'
import styles from './Share.scss'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import cssModules from 'react-css-modules'
import actions from 'redux/actions'
import CopyToClipboard from 'react-copy-to-clipboard'


@injectIntl
@cssModules(styles, { allowMultiple: true })

export default class Share extends Component {

  componentDidMount = () => {
    const { props: { data: { link, title } } } = this

    if (navigator.share) {
      navigator.share({
        title: title,
        url: link
      }).catch(console.error)
      actions.modals.closeAll()

    }

  }

  render() {
    const { props: { data: { link, title } } } = this

    if (!link && data) {
      // @ToDo return error
    }

    let name = 'ShareModal';
    let modalTitle = 'Share';

    return (
      <Modal name={name} title={modalTitle} >
        <span styleName="targets">
          <a styleName="button" href={'https://www.facebook.com/sharer/sharer.php?u=' + encodeURI(link) + '&t=' + title} target="_blank">
            <i styleName="icon" className="fab fa-facebook" />
            <span>Facebook</span>
          </a>
          <a styleName="button" href={'https://twitter.com/intent/tweet?text=' + encodeURIComponent(title) + '&url' + encodeURI(link)}>
            <i styleName="icon" className="fab fa-twitter" />
            <span>Twitter</span>
          </a>
          <a styleName="button" href={'https://www.linkedin.com/shareArticle?mini=true&url=' + encodeURI(link) + '&title=' + encodeURIComponent(title)}>
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
          <CopyToClipboard text={link}>
            <button styleName="copy-link">
              <FormattedMessage
                id="ShareModal1"
                defaultMessage="Copy Link"
              />
            </button>
          </CopyToClipboard>
        </div>
      </Modal >
    )
  }
}