import { Modal } from 'components/modal'

interface Props {
  data: any
  onSwap: VoidFunction
  onClose: VoidFunction
}

export default function ReviewSwapModal(props: Props) {
  const { data, onSwap, onClose } = props

  return (
    <div className="swapPreviewModal">
      <Modal
        name={'Preview swap'}
        title={'Preview your swap to be sure you are good to go'}
        onClose={onClose}
        showCloseButton
      >
        <>{JSON.stringify(data, undefined, 2)}</>
        <button onClick={onSwap}>Swap</button>
      </Modal>
    </div>
  )
}
