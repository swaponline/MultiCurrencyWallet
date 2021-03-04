import React from 'react';
import { Web3ReactContextInterface } from './types';
export declare const PRIMARY_KEY = "primary";
interface Web3ReactProviderArguments {
    getLibrary: (provider?: any, connector?: Required<Web3ReactContextInterface>['connector']) => any;
    children: any;
}
export declare function createWeb3ReactRoot(key: string): (args: Web3ReactProviderArguments) => JSX.Element;
export declare const Web3ReactProvider: (args: Web3ReactProviderArguments) => JSX.Element;
export declare function getWeb3ReactContext<T = any>(key?: string): React.Context<Web3ReactContextInterface<T>>;
export declare function useWeb3React<T = any>(key?: string): Web3ReactContextInterface<T>;
export {};
