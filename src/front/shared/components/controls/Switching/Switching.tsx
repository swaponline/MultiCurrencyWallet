import CSSModules from 'react-css-modules'
import styles from './Switching.scss'
import cx from 'classnames'

type SwitchingProps = {
  onClick: () => void
  noneBorder?: boolean
}

const doNothing = () => {}

const Switching = (props: SwitchingProps) => {
  const { onClick = doNothing, noneBorder = false } = props

  const styleName = cx('switching', {
    'noneBorder': noneBorder,
  })

  return (
    <button type="button" onClick={onClick} styleName={styleName} className="fas fa-exchange-alt" />
  )
}

export default CSSModules(Switching, styles, { allowMultiple: true })
