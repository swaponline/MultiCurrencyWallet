import React, { Component, RefObject } from 'react'
import { constants } from 'helpers'

import cssModules from 'react-css-modules'
import styles from './MnemonicInput.css'

import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import { isMobile } from 'react-device-detect'

import * as bip39 from 'bip39'
import ReactTags from 'react-tag-autocomplete'

const langPrefix = `MnemonicInputComponent`
const langLabels = defineMessages({
  placeholder: {
    id: `${langPrefix}_Placeholder`,
    defaultMessage: `Начните вводить секретную фразу`,
  },
  deleteText: {
    id: `${langPrefix}_DeleteText`,
    defaultMessage: `Нажмите, чтобы удалить слово`,
  },
})

const isDark = localStorage.getItem(constants.localStorage.isDark)

type MnemonicInputProps = {
  onChange: (string) => void
  fullWidth?: boolean
  autoFill?: boolean
  intl?: { [key: string]: any }
}

type Tags = {
  id: number
  name: string
}[]

type MnemonicInputState = {
  suggestions: Tags
  tags: Tags
  isPlaceholderVisible: boolean
  busy?: boolean
}

@injectIntl
@cssModules(styles, { allowMultiple: true })
export default class MnemonicInput extends Component {
  /* 
  * This phrase just for test
  * If config entry point equals testnet
  * Then fill in the input with a test phrase
  */
  private TESTNET_TEST_PHRASE = 'vast bronze oyster trade love once fog match rail lock cake science'
  private TESTNET_TAGS: Tags

  props: MnemonicInputProps
  state: MnemonicInputState
  reactTags: RefObject<any>

  constructor (props) {
    super(props)

    const suggestions = bip39.wordlists.english.map((name, id) => { return { id, name } })

    this.TESTNET_TAGS = this.TESTNET_TEST_PHRASE.split(' ').map(word => {
      return suggestions.find(obj => obj.name === word)
    })

    this.state = {
      tags: [],
      suggestions,
      isPlaceholderVisible: true,
    }

    this.reactTags = React.createRef()
  }

  componentDidMount() {
    const { autoFill = false } = this.props
    // look > onAddition()
    if (autoFill) {
      this.onAddition(this.TESTNET_TAGS[this.TESTNET_TAGS.length - 1])
    }
  }

  onChangeCallback () {
    const {
      props: {
        onChange,
      },
      state: {
        tags,
      },
    } = this

    const words = tags.map(tagData => tagData.name)
    this.setState({ isPlaceholderVisible: words.length < 12 })

    const mnemonic = words.join(` `)

    if (onChange instanceof Function) {
      onChange(mnemonic)
    }
  }

  onDelete = (i) => {
    const tags = this.state.tags.slice(0)
    tags.splice(i, 1)
    this.setState({ tags }, this.onChangeCallback )
  }

  onAddition = (tag) => {
    const { autoFill = false } = this.props
    /* 
    * there is probably a better solution to autofill ReactTags component 
    * you need to call this callback at least once
    * so pass the last element in the argument
    */
    const testnetTagsWithoutLastElement = this.TESTNET_TAGS.filter((tag, index) => {
      return this.TESTNET_TAGS.length - 1 !== index
    })

    const tags = autoFill
      ? [...testnetTagsWithoutLastElement, tag]
      : [...this.state.tags, tag]

    this.setState({ tags }, this.onChangeCallback )
  }

  onInput = (query) => {
    const allowedСhars = /[A-Za-z]/
    const isPasteWords = query.trim().split(/\s+/g)

    if (query.match(allowedСhars) === null) {
      return null
    } else if (isPasteWords.length === 12) {
      /* This pasted of phrase */
      const tags = isPasteWords.map((name, id) => { return { id, name } })
      this.setState({ tags }, () => {
        this.reactTags.current.clearInput()
        this.onChangeCallback()
      })
    } else if (!this.state.busy) {
      this.setState({ busy: true })

      return fetch(`query=${query}`).then((result) => {
        this.setState({ busy: false })
      })
    } 
  }

  render () {
    const {
      props: {
        intl,
        fullWidth,
      },
      state: {
        tags,
        suggestions,
        isPlaceholderVisible
      },
      reactTags,
    } = this

    return (
      <div translate="no" className={`notranslate mnemonicInput ${(isDark) ? '--is-dark' : ''} ${(isMobile) ? '--is-mobile' : ''} ${(fullWidth) ? '--full-width' : ''}`}>
        <ReactTags
          ref={reactTags}
          tags={tags}
          autoresize={true}
          suggestions={suggestions}
          onDelete={this.onDelete}
          onAddition={this.onAddition}
          onInput={this.onInput}
          placeholderText={isPlaceholderVisible ? intl.formatMessage(langLabels.placeholder) : ''}
          removeButtonText={intl.formatMessage(langLabels.deleteText)}
          delimiters={[`Enter`, `Tab`, ` `, `,`]}
        />
      </div>
    )
  }
}
