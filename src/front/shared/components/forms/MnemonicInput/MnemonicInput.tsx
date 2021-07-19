import React, { Component, RefObject } from 'react'
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

@cssModules(styles, { allowMultiple: true })
class MnemonicInput extends Component<MnemonicInputProps, MnemonicInputState> {
  /* 
  * This phrase just for test
  * If config entry point equals testnet
  * Then fill in the input with a test phrase
  */
  private TESTNET_TEST_PHRASE = 'vast bronze oyster trade love once fog match rail lock cake science'
  private TESTNET_TAGS: Tags
  private isAutofill = false

  reactTags: RefObject<any>

  constructor (props) {
    super(props)

    const { autoFill = false } = props
    const suggestions = bip39.wordlists.english.map((name, id) => { return { id, name } })

    if (autoFill) {
      this.isAutofill = true
      //@ts-ignore: strictNullChecks
      this.TESTNET_TAGS = this.TESTNET_TEST_PHRASE.split(' ').map(word => {
        return suggestions.find(obj => obj.name === word)
      })
    }

    this.state = {
      tags: [],
      suggestions,
      isPlaceholderVisible: true,
    }

    this.reactTags = React.createRef()
  }

  componentDidMount() {
    const { autoFill = false } = this.props

    if (autoFill) { // without last element
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
    /* 
    * there is probably a better solution to autofill ReactTags component 
    * you need to call this callback at least once
    * so pass the last element in the argument
    */
   const returnTags = () => {
     if (this.isAutofill) {
        const testnetTagsWithoutLastElement = this.TESTNET_TAGS.filter((tag, index) => {
         return this.TESTNET_TAGS.length - 1 !== index
        })
        this.isAutofill = false
        return [...testnetTagsWithoutLastElement, tag]
      } else {
        return [...this.state.tags, tag]
      }
    }

    const tags = returnTags()
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
      <div translate="no" className={`notranslate mnemonicInput ${(isMobile) ? '--is-mobile' : ''} ${(fullWidth) ? '--full-width' : ''}`}>
        <ReactTags
          ref={reactTags}
          tags={tags}
          autoresize={true}
          suggestions={suggestions}
          onDelete={this.onDelete}
          onAddition={this.onAddition}
          onInput={this.onInput}
          //@ts-ignore: strictNullChecks
          placeholderText={isPlaceholderVisible ? intl.formatMessage(langLabels.placeholder) : ''}
          //@ts-ignore: strictNullChecks
          removeButtonText={intl.formatMessage(langLabels.deleteText)}
          delimiters={[`Enter`, `Tab`, ` `, `,`]}
        />
      </div>
    )
  }
}

export default injectIntl(MnemonicInput)
