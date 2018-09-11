import React from 'react'

import { Link } from 'react-router-dom'

import actions from 'redux/actions'
import { links } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './EthChecker.scss'

import { Modal } from 'components/modal'
import { Button } from 'components/controls'


const EthChecker = ({ name }) => (
  <Modal name={name} title="Approve token">
    <div styleName="content">
      <p>This token works on Ethereum blockchain. To swap this token you must have at least 0.02 ETH on your balance</p>
      <Link to={links.home}>
        <Button
          styleName="button"
          brand
          fullWidth
          onClick={() => actions.modals.close(name)}
        >
          Go wallet
        </Button>
      </Link>
    </div>
  </Modal>
)

export default CSSModules(EthChecker, styles)
