
import React from 'react'

export default ({ text }) => {
   
  const shortText = text.length > 10 ? 
              text.substring(0, 4) + '&#183;&#183;&#183;' + text.substring(text.length - 4, text.length)
              :
              text
     
  /* eslint-disable */
  return (
    <span>
      {shortText}
    </span>
  )
  /* eslint-enable */
}