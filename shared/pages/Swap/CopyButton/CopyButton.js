import React, { Fragment } from 'react'

import { FormattedMessage } from 'react-intl'
import CopyToClipboard from 'react-copy-to-clipboard'
import Button from 'components/controls/Button/Button'


const CopyButton = (props) => {
  const { text, onCopy, isTextCopied } = props

  return (
    <Fragment>
      <p>
        <FormattedMessage id="BtcToEthTokenAddress137" defaultMessage="Do not exist Etherium on your balance, copy your address and deposit funds to your wallet" />
      </p>
      <CopyToClipboard text={text} onCopy={onCopy}>
        <Button brand styleName="button">
          { isTextCopied
            ? <FormattedMessage id="BtcToEthTokenAddress142" defaultMessage="Address copied to clipboard" />
            : <FormattedMessage id="BtcToEthTokenAddress143" defaultMessage="Copy to clipboard" />
          }
        </Button>
      </CopyToClipboard>
    </Fragment>
  )
}

export default CopyButton
