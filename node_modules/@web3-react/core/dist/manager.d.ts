import { Web3ReactManagerReturn } from './types';
export declare class UnsupportedChainIdError extends Error {
    constructor(unsupportedChainId: number, supportedChainIds?: readonly number[]);
}
export declare function useWeb3ReactManager(): Web3ReactManagerReturn;
