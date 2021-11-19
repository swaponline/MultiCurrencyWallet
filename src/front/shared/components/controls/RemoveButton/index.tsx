import CSSModules from 'react-css-modules'
import styles from './index.scss'

type RemoveButtonProps = {
  onClick: () => void
  brand?: boolean
  id?: string
}

const RemoveButton = (props: RemoveButtonProps) => {
  const { brand = false, onClick, id = '' } = props

  return <button id={id} styleName={`removeButton ${brand ? 'brand' : ''}`} onClick={onClick} />
}

export default CSSModules(RemoveButton, styles, { allowMultiple: true })
