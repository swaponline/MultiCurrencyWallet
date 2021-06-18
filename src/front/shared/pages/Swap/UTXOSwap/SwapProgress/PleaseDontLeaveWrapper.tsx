import React, { Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import Copy from 'components/ui/Copy/Copy'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import styles from './SwapProgress.scss'
import { constants } from 'helpers'


const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
const showWIF = (mnemonic && mnemonic !== `-`)
const swapWIF = localStorage.getItem(constants.privateKeyNames.ghost)

const PleaseDontLeaveWrapper = (props) => {
  const { children, isBtcLike } = props

  return (
    <Fragment>
      {children}
      <div styleName="dontLeave">
        <FormattedMessage id="swapprogressDONTLEAVE" defaultMessage="Please do not leave this page " />
        <Tooltip
          id="swapjsdontleave"
          dontHideMobile={true}
        >
          <p>
            <FormattedMessage
              id="swapjsdontleave"
              defaultMessage="The exchange requires signing with private keys that only your browser knows."
            />
          </p>
          {(isBtcLike) && (
            <p>
              <FormattedMessage
                id="swapjsdontleavesavesecret"
                defaultMessage="If you want to leave this page please save the secret." />
            </p>
          )}
        </Tooltip>
        {(isBtcLike) && (
          <strong styleName="saveSecretKey">
            <FormattedMessage id="swapprogressDONTLEAVEBTC" defaultMessage="Or save this SECRET before you leave:" />

            <Copy text={isBtcLike}>
              <em>{isBtcLike}</em>
            </Copy>

            {(showWIF) && (
              <Copy text={swapWIF}>
                <em>{swapWIF}</em>
              </Copy>
            )}
          </strong>
        )}
      </div>
    </Fragment>
  )
}

export default CSSModules(PleaseDontLeaveWrapper, styles, { allowMultiple: true })
