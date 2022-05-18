import React, { Component, ReactNode } from 'react'
import cx from 'classnames'
import cssModules from 'react-css-modules'
import Link from 'local_modules/sw-valuelink'
import { FormattedMessage } from 'react-intl'
import Input from 'components/forms/Input/Input'
import OutsideClick from 'components/OutsideClick'
import styles from './index.scss'

type DropDownProps = {
  selectedValue: string
  items: IUniversalObj[]
  selectedItemRender?: (item) => void
  itemRender: (item) => ReactNode
  onSelect?: (item) => void
  className?: string
  name?: string | JSX.Element
  placeholder?: string
  arrowSide?: string
  disableSearch?: boolean
  dontScroll?: boolean
  disabled?: boolean
  role?: string
}

type DropDownState = {
  error: boolean
  optionToggleIsOpen: boolean
  inputValue: string
  selectedValue: string
}

@cssModules(styles, { allowMultiple: true })
export default class DropDown extends Component<DropDownProps, DropDownState> {
  constructor(props: DropDownProps) {
    super(props)

    const { selectedValue } = props

    this.state = {
      optionToggleIsOpen: false,
      selectedValue,
      inputValue: '',
      error: false,
    }
  }

  toggleClose = () => {
    this.setState(() => ({
      optionToggleIsOpen: false,
    }))
  }

  toggleOpen = () => {
    const { disabled } = this.props
    if (disabled) return

    this.setState(() => ({
      optionToggleIsOpen: true,
    }))
  }

  handleOptionClick = (item) => {
    const { onSelect } = this.props

    // for example we'd like to change `selectedValue` manually
    if (typeof onSelect === 'function' && !item.disabled) {
      onSelect(item)
      this.setState({ selectedValue: item.value })
    }

    this.toggleClose()
  }

  renderSelectedItem = () => {
    const {
      items,
      selectedItemRender,
      selectedValue: propsSelectedValue,
    } = this.props
    const {
      selectedValue: stateSelectedValue,
    } = this.state

    const selectedValue = propsSelectedValue || stateSelectedValue
    const selectedItem = items.find(({ value }) => value === selectedValue)

    if (selectedItem !== undefined) {
      if (typeof selectedItemRender !== 'function') {
        const textToShow = selectedItem.title || selectedItem.fullTitle
        return (
          <div
            styleName={`selectedItemInner ${selectedItem.disabled ? 'disabled' : ''} ${
              selectedItem.reduceSelectedItemText ? 'reducedLength' : ''
            }`}
          >
            {textToShow}
          </div>
        )
      }
      return selectedItemRender(selectedItem)

    }
  }

  handleClickOutside = () => {
    const { disableSearch } = this.props
    const { optionToggleIsOpen } = this.state
    const linkedValue = Link.all(this, 'inputValue')

    if (optionToggleIsOpen) {
      // cleanup the search field
      if (!disableSearch) {
        linkedValue.inputValue.set('')
      }

      this.toggleClose()
    }
  }

  render() {
    const {
      className,
      name,
      placeholder,
      items,
      selectedValue,
      disableSearch,
      dontScroll, // Show all items, for small lists
      arrowSide,
      role,
      itemRender,
      disabled,
    } = this.props

    const { optionToggleIsOpen, inputValue } = this.state
    const dropDownStyleName = cx('dropDown', { active: optionToggleIsOpen })
    const {
      inputValue: linkedInputValue,
    } = Link.all(this, 'inputValue')

    let itemsFiltered = items
    // Filtering values for search input
    if (!disableSearch && inputValue) {
      itemsFiltered = items
        .filter((item) => item.name.includes(inputValue.toUpperCase()))
        .filter((item) => item.value !== selectedValue)
    }

    const noOptions = itemsFiltered.length === 0
    const moreThenOneOption = itemsFiltered.length > 1

    const dropDownId = role ? `dropDown${role}` : 'dropDownNoRole'

    return (
      <OutsideClick outsideAction={this.handleClickOutside}>
        <div
          styleName={`${dropDownStyleName}`}
          className={className}
        >
          <div
            className={dropDownId}
            styleName={`
              selectedItem
              ${arrowSide === 'left' ? 'left' : ''}
              ${!moreThenOneOption ? 'single' : ''}
            `}
            onClick={moreThenOneOption ? this.toggleOpen : () => null}
          >
            {/* Drop Down arrow */}
            {moreThenOneOption && !disabled && <div styleName={`arrow ${arrowSide === 'left' ? 'left' : ''}`} />}

            {/* Search input */}
            {optionToggleIsOpen && !disableSearch ? (
              <Input
                styleName="searchInput"
                placeholder={placeholder}
                valueLink={linkedInputValue}
                focusOnInit
              />
            ) : (
              this.renderSelectedItem()
            )}
          </div>

          {/* Drop Down list */}
          {optionToggleIsOpen && (
            <div styleName={`select ${dontScroll ? 'dontscroll' : ''}`}>
              {name ? <span styleName="listName">{name}</span> : ''}

              {noOptions ? (
                <FormattedMessage id="DropDownNoOptionsInTheList" defaultMessage="No options" />
              ) : moreThenOneOption ? (
                itemsFiltered.map((item, index) => {
                  if (!item.hidden) {
                    return (
                      <div
                        id={item.value}
                        key={index}
                        styleName="dropDownItem"
                        onClick={() => {
                          linkedInputValue.set('')
                          this.handleOptionClick(item)
                        }}
                      >
                        {itemRender(item)}
                      </div>
                    )
                  }

                  return null
                })
              ) : (
                <div
                  styleName="dropDownItem"
                  onClick={() => {
                    linkedInputValue.set('')
                    this.handleOptionClick(itemsFiltered[0])
                  }}
                >
                  {itemRender(itemsFiltered[0])}
                </div>
              )}
            </div>
          )}
        </div>
      </OutsideClick>
    )
  }
}
