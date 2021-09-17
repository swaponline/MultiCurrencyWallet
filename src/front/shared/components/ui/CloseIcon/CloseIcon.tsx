import cssModules from 'react-css-modules'
import styles from './CloseIcon.scss'

type ComponentProps = {
  onClick: (...args: any) => void
  styleName?: string
  id?: string
}

const CloseIcon = (props: ComponentProps) => {
  const { onClick, styleName = '', id = '', ...rest } = props

  return (
    <div id={id} styleName="button" {...rest} role="closeButton" onClick={onClick}>
      <div styleName="icon" role="closeIcon" />
    </div>
  )
}

export default cssModules(CloseIcon, styles, { allowMultiple: true })
