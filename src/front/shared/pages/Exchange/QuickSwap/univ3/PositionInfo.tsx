import { useState, useEffect, useRef } from 'react'
import { FormattedMessage } from 'react-intl'
import styles from './PositionInfo.scss'
import CSSModules from 'react-css-modules'
import BigNumber from 'bignumber.js'

import {
  PositionAction,
} from './types'

import Button from 'components/controls/Button/Button'
import InfoBlock from './ui/InfoBlock'
import BackButton from './ui/BackButton'


function PositionInfo(props) {
  const {
    setCurrentAction,
    positionInfo,
    baseCurrency,
    chainId,
  } = props

  return (
    <div>
      <BackButton onClick={() => { setCurrentAction(PositionAction.LIST) }}>
        <FormattedMessage id="qs_uni_return_to_pos_list" defaultMessage="Return back to positions list" />
      </BackButton>
      <InfoBlock
        positionInfo={positionInfo}
        baseCurrency={baseCurrency}
        chainId={chainId}
      />
      <div>
        <Button
          brand
          onClick={() => { setCurrentAction(PositionAction.ADD_LIQUIDITY) }}
        >
          <FormattedMessage
            id="qs_uni_pos_liq_add"
            defaultMessage="Increase liquidity"
          />
        </Button>
        <Button
          brand
          onClick={() => { setCurrentAction(PositionAction.DEL_LIQUIDITY) }}
        >
          <FormattedMessage
            id="qs_uni_pos_liq_del"
            defaultMessage="Remove liquidity"
          />
        </Button>
      </div>
    </div>
  )
}

export default CSSModules(PositionInfo, styles, { allowMultiple: true })