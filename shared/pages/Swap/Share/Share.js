import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Share.scss'

import { Button } from 'components/controls'
import Href from 'components/Href/Href'
import { FormattedMessage } from 'react-intl'


const Share = ({ flow }) => (
  flow.step >= 5 && (
    <Href tab="https://twitter.com/intent/tweet?url=https://swaponline.io/&text=I%20just%20make%20swap%20on%20&hashtags=AtomicSwap,DEX,Bitcoin,SWAP&via=SwapOnlineTeam">
      <Button brand>
        <FormattedMessage id="Share" defaultMessage="Share Twitter" />
      </Button>
    </Href>
  )
)

export default CSSModules(Share, styles)
