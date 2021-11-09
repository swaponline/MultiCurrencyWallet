import CSSModules from 'react-css-modules'
import styles from './index.scss'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'

const doNothing = () => {}

function InputRow(props) {
  const {
    labelMessage,
    labelTooltip,
    onKeyUp = doNothing,
    onKeyDown = doNothing,
    valueLink,
    styleName = '',
    margin = false,
  } = props

  return (
    <div styleName="inputWrapper">
      <FieldLabel>
        {labelMessage} {labelTooltip}
      </FieldLabel>
      <Input
        styleName={styleName}
        pattern="0-9\."
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        valueLink={valueLink}
        withMargin={margin}
      />
    </div>
  )
}

export default CSSModules(InputRow, styles, { allowMultiple: true })
