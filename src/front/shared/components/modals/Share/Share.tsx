import React, { Component } from 'react'
import { Modal } from 'components/modal'
import styles from './Share.scss'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import cssModules from 'react-css-modules'
import CopyToClipboard from 'react-copy-to-clipboard'
import actions from 'redux/actions'
import Button from 'components/controls/Button/Button'



const langLabels = defineMessages({
  copyLink: {
    id: 'ShareModal1',
    defaultMessage: 'Copy Link',
  },
  linkCopied: {
    id: 'InvoiceLinkCopied',
    defaultMessage: 'Link copied',
  },
})

@cssModules(styles, { allowMultiple: true })
class Share extends Component<any, any> {

  state = {
    isLinkCopied: false,
  }

  componentDidMount = () => {
    const { props: { data: { link, title } } } = this

    if (navigator.share) {
      navigator.share({
        title: title,
        url: link
      }).catch(console.error);
      actions.modals.close('ShareModal')
    }
  }

  handleCopyLink = () => {
    this.setState({
      isLinkCopied: true,
    }, () => {
      setTimeout( () => {
        this.setState({
          isLinkCopied: false,
        })
      }, 1000)
    })
  }

  render() {
    const {
      props: {
        data: {
          link,
          title,
        },
      },
      state: {
        isLinkCopied,
      },
    } = this

    let name = 'ShareModal';
    let titleModal = 'Share';
    
    return (
      <Modal name={name} title={titleModal} >
          <span styleName="targets">
          <a styleName="button" href={'https://www.facebook.com/sharer/sharer.php?u=' + encodeURI(link) + '&t=' + title} target="_blank">
            <i styleName="icon" className="fab fa-facebook" />
            <span>Facebook</span>
          </a>
          <a styleName="button" href={'https://twitter.com/intent/tweet?text=' + encodeURIComponent(title) + '&url=' + encodeURI(link)} target="_blank">
            <i styleName="icon" className="fab fa-twitter" />
            <span>Twitter</span>
          </a>
          <a styleName="button" href={'https://www.linkedin.com/shareArticle?mini=true&url=' + encodeURI(link) + '&title=' + encodeURIComponent(title)} target="_blank">
            <i styleName="icon" className="fab fa-linkedin" />
            <span>LinkedIn</span>
          </a>
          <a styleName="button" href={'mailto:x@y.com?body=' + encodeURI(link) + '&subject=' + encodeURIComponent(title)}>
            <i styleName="icon" className="fas fa-envelope" />
            <span>Email</span>
          </a>
        </span>
        <div styleName="copyButtonHolder">
          <CopyToClipboard
            text={link}
            onCopy={this.handleCopyLink}
          >
            <Button blue disabled={isLinkCopied}>
              <FormattedMessage { ... ((isLinkCopied) ? langLabels.linkCopied : langLabels.copyLink) } />
            </Button>
          </CopyToClipboard>
        </div>
        <CopyToClipboard
            text={link}
            onCopy={this.handleCopyLink}
          >
          <div styleName="link">
            <span>{link}</span>
          </div>
        </CopyToClipboard>
      </Modal>
    )
  }
}

export default injectIntl(Share)
