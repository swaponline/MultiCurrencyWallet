import { ConnectorUpdate } from '@web3-react/types';
import { AbstractConnector } from '@web3-react/abstract-connector';
export declare const URI_AVAILABLE = "URI_AVAILABLE";
export declare class UserRejectedRequestError extends Error {
    constructor();
}
interface WalletConnectConnectorArguments {
    rpc: {
        [chainId: number]: string;
    };
    bridge?: string;
    qrcode?: boolean;
    pollingInterval?: number;
}
export declare class WalletConnectConnector extends AbstractConnector {
    private readonly rpc;
    private readonly bridge?;
    private readonly qrcode?;
    private readonly pollingInterval?;
    walletConnectProvider?: any;
    constructor({ rpc, bridge, qrcode, pollingInterval }: WalletConnectConnectorArguments);
    private handleChainChanged;
    private handleAccountsChanged;
    private handleDisconnect;
    activate(): Promise<ConnectorUpdate>;
    getProvider(): Promise<any>;
    getChainId(): Promise<number | string>;
    getAccount(): Promise<null | string>;
    deactivate(): void;
    close(): Promise<void>;
}
export {};
