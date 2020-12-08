import 'react'

declare module 'react' {
  interface Attributes {
    styleName?: string;
    type?: string;
    title?: any;
  }
}

declare global {
  interface IEtheriumProvider {
    [key: string]: any;
    isLiquality?: boolean;
    isTrust?: boolean;
    isMetaMask2?: boolean;
  }

  interface Window {
    [key: string]: any;
    ethereum?: IEtheriumProvider;
  }

  interface Navigator {
    [key: string]: any
  }
}