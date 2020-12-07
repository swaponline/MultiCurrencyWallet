import 'react'

declare module 'react' {
  interface Attributes {
    styleName?: string;
    type?: string;
    title?: any;
  }
}

declare global {
  interface Window {
    [key: string]: any
  }
}