import Multiaddr = require('multiaddr');

export declare interface Mafmt {
  toString(): string;
  input?: (Mafmt | (() => Mafmt))[];
  matches: (a: string | Uint8Array | Multiaddr) => boolean;
  partialMatch: (protos: string[]) => boolean;
}

export const DNS: Mafmt;
export const DNS4: Mafmt;
export const DNS6: Mafmt;
export const IP: Mafmt;
export const TCP: Mafmt;
export const UDP: Mafmt;
export const QUIC: Mafmt;
export const UTP: Mafmt;
export const HTTP: Mafmt;
export const HTTPS: Mafmt;
export const WebSockets: Mafmt;
export const WebSocketsSecure: Mafmt;
export const WebSocketStar: Mafmt;
export const WebRTCStar: Mafmt;
export const WebRTCDirect: Mafmt;
export const Reliable: Mafmt;
export const Stardust: Mafmt;
export const Circuit: Mafmt;
export const P2P: Mafmt;
export const IPFS: Mafmt;
