import 'react'

declare module 'react' {
  interface Attributes {
    styleName?: string
    type?: string
    title?: any
    alt?: string
  }
}

declare global {
  interface EthereumProvider {
    [key: string]: any
    isLiquality?: boolean
    isTrust?: boolean
    isMetaMask?: boolean
  }

  interface Window {
    [key: string]: any
    ethereum?: EthereumProvider
  }

  interface Navigator {
    [key: string]: any
  }

  interface IUniversalObj { 
    [key: string]: any
  }

  interface IError {
    errno?: number
    code?: number
    path?: string
    name?: string
    message?: string
    syscall?: string
    stack?: string
  }

  interface EvmNetworkConfig {
    currency: string
    chainId: string
    networkVersion: number
    chainName: string
    rpcUrls: string[]
    blockExplorerUrls: string[]
  }

}
