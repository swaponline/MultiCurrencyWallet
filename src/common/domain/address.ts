export enum AddressType {
  Internal = 'Internal',
  Metamask = 'Metamask',
  Custom = 'Custom',
}

export enum AddressFormat {
  Full = 'Full',
  Short = 'Short', // 0x12...cdef
  Auto = 'Auto', // todo
}

export enum AddressRole {
  Send = 'Send',
  Receive = 'Receive',
}
