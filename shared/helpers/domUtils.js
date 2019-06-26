import ReactDOM from 'react-dom'


export const bodySelector = document.querySelector('body')
export const portalSelector = document.getElementById('portal')

export const fixBodyOverflow = (fix) => {
  bodySelector.style.overflow = !!fix ? 'hidden' : 'auto'
}

export const inputReplaceCommaWithDot = (event) => {
  const isCommaKey = event.key === ','

  if (isCommaKey) {
    event.preventDefault()
    document.execCommand('insertHTML', false, '.')
  }
}

export const createPortal = (component, customSelector = null) => ReactDOM.createPortal(component, customSelector || portalSelector)

export const animate = (draw, duration) => {
  let start = performance.now()

  requestAnimationFrame(function animate(time) {
    let timePassed = time - start

    if (timePassed > duration) timePassed = duration

    draw(timePassed)

    if (timePassed < duration) {
      requestAnimationFrame(animate)
    }

  })
}
