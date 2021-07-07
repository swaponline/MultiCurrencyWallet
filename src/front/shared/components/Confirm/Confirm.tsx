import React from 'react'
import cssModules from 'react-css-modules'
import styles from './Confirm.scss'

import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import Button from 'components/controls/Button/Button'
import Center from 'components/layout/Center/Center'
import { FormattedMessage } from 'react-intl'

type ComponentProps = {
  rootClassName: string
  isConfirm: () => void
  isReject: () => void
  title: () => JSX.Element
  animation: boolean
}

const Confirm = (props: ComponentProps) => {
  const { rootClassName, isConfirm, isReject, title, animation } = props

  return (
    <Center>
      <div styleName={animation ? 'confirm animation' : 'confirm'} className={rootClassName}>
        <SubTitle>{title}</SubTitle>
        <div styleName="row">
          <Button brand onClick={isConfirm}>
            <h3>
              <FormattedMessage id="Confirm20" defaultMessage="Yes" />
            </h3>
          </Button>
          <Button brand onClick={isReject}>
            <h3>
              <FormattedMessage id="ConConfirm25firm20" defaultMessage="No" />
            </h3>
          </Button>
        </div>
      </div>
    </Center>
  )
}

export default cssModules(Confirm, styles, { allowMultiple: true })
