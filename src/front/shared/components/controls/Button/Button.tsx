import React from "react";
import { constants } from 'helpers'
import cx from "classnames";
import { FormattedMessage } from 'react-intl'
import cssModules from 'react-css-modules'
import styles from './Button.scss'

type ButtonProps = {
  dataTut?: any
  children?: any
  fullWidth?: boolean
  autoHeight?: boolean
  transparent?: boolean
  brand?: boolean
  blue?: boolean
  gray?: boolean
  big?: boolean
  small?: boolean
  empty?: boolean
  link?: boolean
  fill?: boolean
  disabled?: boolean
  pending?: boolean
  className?: string
  id?: string
  onClick?: () => void
}

const Button = (props: ButtonProps) => {
  const {
    children,
    className,
    fullWidth,
    brand,
    transparent,
    blue,
    gray,
    disabled,
    pending,
    big,
    small,
    empty,
    link,
    autoHeight,
    onClick,
    id = '',
    fill,
    dataTut,
  } = props

  const styleName = cx('button', {
    fill,
    fullWidth,
    brand,
    transparent,
    blue,
    gray,
    big,
    small,
    empty,
    link,
    autoHeight,
    disabled,
  })

  return (
    <button
      data-tut={dataTut}
      styleName={styleName}
      className={className}
      onClick={onClick}
      id={id}
      disabled={disabled}
      data-tip
      data-for={id}
    >
      {pending ? (
          <span styleName="pending">
            <FormattedMessage id="ButtonPendingState" defaultMessage="Pending" />
          </span>
        ) : children
      }
    </button>
  )
}

export default cssModules(Button, styles, { allowMultiple: true })
