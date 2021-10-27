import cx from "classnames";
import { FormattedMessage } from 'react-intl'
import cssModules from 'react-css-modules'
import styles from './Button.scss'

type ButtonProps = {
  dataTut?: any
  children?: any
  fullWidth?: boolean
  center?: boolean
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
  flex?: boolean
  disabled?: boolean
  dangerous?: boolean
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
    center,
    brand,
    transparent,
    blue,
    gray,
    disabled,
    dangerous,
    pending,
    big,
    small,
    empty,
    link,
    autoHeight,
    onClick,
    id = '',
    fill,
    flex,
    dataTut,
  } = props

  const styleName = cx('button', {
    fill,
    flex,
    fullWidth,
    center,
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
    dangerous,
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
