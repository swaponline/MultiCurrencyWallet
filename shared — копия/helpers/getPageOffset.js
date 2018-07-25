const getPageOffset = () => {
  // isCSS1Compat for old browsers support like IE < 9,
  // which do not have window.pageYOffset and window.scrollY
  // For more info check https://developer.mozilla.org/ru/docs/Web/API/Window/scrollY
  const isCSS1Compat = ((document.compatMode || '') === 'CSS1Compat')
  const isSupportPageOffset = window.pageXOffset !== undefined

  if (isSupportPageOffset) {

    return {
      x: window.pageXOffset,
      y: window.pageYOffset,
    }
  }

  return {
    x: isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft,
    y: isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop,
  }
}


export default getPageOffset
