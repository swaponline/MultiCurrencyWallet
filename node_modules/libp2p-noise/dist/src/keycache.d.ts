import { bytes32 } from './@types/basic';
import PeerId from 'peer-id';
/**
 * Storage for static keys of previously connected peers.
 */
declare class Keycache {
    private readonly storage;
    store(peerId: PeerId, key: bytes32): void;
    load(peerId?: PeerId): bytes32 | null;
    resetStorage(): void;
}
declare const KeyCache: Keycache;
export { KeyCache };
//# sourceMappingURL=keycache.d.ts.map