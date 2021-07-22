import { useRef } from 'react'
import { externalConfig } from 'helpers'
import Promo from './Promo/Promo'
import AtomicSwap from './AtomicSwap'
import SomeSwap from './SomeSwap'
import Quote from './Quote'
import HowItWorks from './HowItWorks/HowItWorks'
import VideoAndFeatures from './VideoAndFeatures/VideoAndFeatures'

function Exchange() {
  const buttonsParent = useRef<HTMLButtonElement>(null)
  const exchanges = [<AtomicSwap />, <SomeSwap />]

  const onClick = (e) => {
    console.log(e)

    if (buttonsParent?.current) {
      const children = buttonsParent.current.childNodes
    }
  }

  return (
    <section>
      <Promo />
      {/* @ts-ignore */}
      <button ref={buttonsParent} onClick={onClick}>
        <span>Atomic swap</span>
        <span>Some swap</span>
      </button>

      {externalConfig?.showHowItsWork && (
        <>
          <HowItWorks />
          <VideoAndFeatures />
          <Quote />
        </>
      )}
    </section>
  )
}

export default Exchange
