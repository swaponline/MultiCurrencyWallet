let _mnemonic : string | boolean = false


const setMnemonic = (newMnemonic : string) => {
  _mnemonic = newMnemonic
}

const getMnemonic = () : string | boolean => {
  return _mnemonic
}


export {
  setMnemonic,
  getMnemonic,
}