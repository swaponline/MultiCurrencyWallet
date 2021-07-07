import React from 'react'
import CSSModules from 'react-css-modules'
import styles from './Toggle.scss'

type ComponentProps = {
  checked: boolean
  onChange: (arg: boolean) => void
  dataTut?: string
  isDisabled?: boolean
}

const Toggle = (props: ComponentProps) => {
  const { checked, onChange, dataTut = null, isDisabled = false } = props
  
  return (
    <label styleName={`Switch ${isDisabled ? 'disabled' : ''}`} data-tut={dataTut} >
      <input type="checkbox" onChange={({ target }) => onChange(target.checked)} checked={checked} disabled={isDisabled} />
      <span /> {/* need for button */}
    </label>
  )
}

export default CSSModules(Toggle, styles, { allowMultiple: true })
