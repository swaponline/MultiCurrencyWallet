/// <reference types="node" />
import { EventEmitter } from 'events';
import { AbstractConnectorArguments, ConnectorUpdate } from '@web3-react/types';
export declare abstract class AbstractConnector extends EventEmitter {
    readonly supportedChainIds?: number[];
    constructor({ supportedChainIds }?: AbstractConnectorArguments);
    abstract activate(): Promise<ConnectorUpdate>;
    abstract getProvider(): Promise<any>;
    abstract getChainId(): Promise<number | string>;
    abstract getAccount(): Promise<null | string>;
    abstract deactivate(): void;
    protected emitUpdate(update: ConnectorUpdate): void;
    protected emitError(error: Error): void;
    protected emitDeactivate(): void;
}
