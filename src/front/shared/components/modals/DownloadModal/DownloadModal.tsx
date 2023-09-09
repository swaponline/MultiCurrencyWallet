import React, { Fragment } from 'react'
import { connect } from 'redaction'
import actions from 'redux/actions'

import cssModules from 'react-css-modules'
import styles from './DownloadModal.scss'

import Modal from 'components/modal/Modal/Modal'
import Button from 'components/controls/Button/Button'
import Copy from 'components/ui/Copy/Copy'

import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'

import { withRouter } from 'react-router-dom'


const title = defineMessages({
  downloadModal: {
    id: 'down97',
    defaultMessage: 'Your private keys!',
  },
})

@withRouter
@connect(
  ({
    user: {
      ethData,
      bnbData,
      maticData,
      arbethData,
      aurethData,
      xdaiData,
      ftmData,
      avaxData,
      movrData,
      oneData,
      phi_v1Data,
      phiData,
      ameData,
      btcData,
      ghostData,
      nextData,
    },
  }) => ({
    items: [
      ethData,
      bnbData,
      maticData,
      arbethData,
      aurethData,
      xdaiData,
      ftmData,
      avaxData,
      movrData,
      oneData,
      phi_v1Data,
      phiData,
      ameData,
      btcData,
      ghostData,
      nextData,
    ],
  })
)
@cssModules(styles)
class DownloadModal extends React.Component<any, any> {
  handleDownloadTxt = () => {
    actions.user.downloadPrivateKeys()
  }

  render() {
    const { items, name, intl } = this.props
    const textToCopy = actions.user.getText()

    const Account = () => (
      items.map((item, index) => (
        <Fragment key={index}>
          <a>
            {item.fullName}
            {' '}
            <FormattedMessage id="downloadModal75" defaultMessage="Address:" />
          </a>
          <p>{item.address}</p>
          <a>
            {item.fullName}
            {' '}
            <FormattedMessage id="downloadModal782" defaultMessage="Private key" />
            {' '}
          </a>

          <p>
            {item.privateKey}
          </p>
        </Fragment>
      ))
    )

    return (
      <Modal name={name} title={intl.formatMessage(title.downloadModal)}>
        <div styleName="subTitle">
          <FormattedMessage
            id="down57"
            defaultMessage="It seems like you're trying to save your private keys. Just copy this keys and paste into notepad textarea. Also you can download it as a .txt file."
          />
        </div>
        <div styleName="buttonsContainer">
          <Copy text={textToCopy}>
            <Button styleName="button" brand>
              <FormattedMessage id="recieved67" defaultMessage="Copy to clipboard" />
            </Button>
          </Copy>
          {
            !(/iPad|iPhone|iPod/.test(navigator.userAgent)) && (
              <Fragment>
                <Button onClick={this.handleDownloadTxt} styleName="button" brand >
                  <FormattedMessage id="downFile2" defaultMessage="Download txt file" />
                </Button>
              </Fragment>
            )
          }
        </div>
        <div styleName="indent">
          <Account />
        </div>
      </Modal>
    )
  }
}

export default injectIntl(DownloadModal)