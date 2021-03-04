import { AbstractConnectorArguments, ConnectorUpdate } from '@web3-react/types';
import { AbstractConnector } from '@web3-react/abstract-connector';
export declare class NoEthereumProviderError extends Error {
    constructor();
}
export declare class UserRejectedRequestError extends Error {
    constructor();
}
export declare class InjectedConnector extends AbstractConnector {
    constructor(kwargs: AbstractConnectorArguments);
    private handleChainChanged;
    private handleAccountsChanged;
    private handleClose;
    private handleNetworkChanged;
    activate(): Promise<ConnectorUpdate>;
    getProvider(): Promise<any>;
    getChainId(): Promise<number | string>;
    getAccount(): Promise<null | string>;
    deactivate(): void;
    isAuthorized(): Promise<boolean>;
}
