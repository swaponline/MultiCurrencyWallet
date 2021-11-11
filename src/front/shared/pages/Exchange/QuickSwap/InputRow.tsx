import CSSModules from 'react-css-modules'
import styles from './index.scss'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'

const doNothing = () => {}

function InputRow(props) {
  const {
    labelMessage,
    labelTooltip,
    disabled = false,
    onKeyUp = doNothing,
    onKeyDown = doNothing,
    valueLink,
    styleName = '',
    placeholder = '',
    margin = false,
  } = props

  return (
    <div styleName={`inputWrapper ${disabled ? 'disabled' : ''}`}>
      <FieldLabel>
        {labelMessage} {labelTooltip}
      </FieldLabel>
      <Input
        disabled={disabled}
        styleName={styleName}
        pattern="0-9\."
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        valueLink={valueLink}
        withMargin={margin}
        placeholder={placeholder}
      />
    </div>
  )
}

export default CSSModules(InputRow, styles, { allowMultiple: true })
