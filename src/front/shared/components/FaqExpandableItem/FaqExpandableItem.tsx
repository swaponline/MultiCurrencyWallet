import React from 'react'
import CSSModules from 'react-css-modules'
import styles from './FaqExpandableItem.scss'
import Href from 'components/Href/Href'

type ComponentProps = {
  question: string
  link: string
}

const FaqExpandableItem = (props: ComponentProps) => {
  const { link, question } = props

  return (
    <div styleName="container">
      <Href tab={link} styleName="header" rel="noreferrer noopener">
        {question}
      </Href>
    </div>
  )
}

export default CSSModules(FaqExpandableItem, styles)
