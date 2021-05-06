import reducers from 'redux/core/reducers'


const open = (name, data: IUniversalObj | null = null) => {
  reducers.modals.open({ name, data })
}

const close = (name) => reducers.modals.close(name)

const closeAll = () => reducers.modals.closeAll()

export default {
  open,
  close,
  closeAll,
}
