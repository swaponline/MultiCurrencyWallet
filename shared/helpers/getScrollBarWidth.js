const getScrollBarWidth = () => {
  const outer = document.createElement('div')

  outer.style.visibility = 'hidden'
  outer.style.width = '100px'
  outer.style.msOverflowStyle = 'scrollbar' // needed for WinJS apps

  document.body.appendChild(outer)

  const widthNoScroll = outer.offsetWidth

  // force scrollbars
  outer.style.overflow = 'scroll'

  // add innerdiv
  const inner = document.createElement('div')

  inner.style.width = '100%'
  outer.appendChild(inner)

  const widthWithScroll = inner.offsetWidth

  // remove divs
  outer.parentNode.removeChild(outer)

  return widthNoScroll - widthWithScroll
}


export default getScrollBarWidth
