import { bytes32 } from './@types/basic'
import PeerId from 'peer-id'

/**
 * Storage for static keys of previously connected peers.
 */
class Keycache {
  private readonly storage = new Map<Uint8Array, bytes32>()

  public store (peerId: PeerId, key: bytes32): void {
    this.storage.set(peerId.id, key)
  }

  public load (peerId?: PeerId): bytes32 | null {
    if (!peerId) {
      return null
    }
    return this.storage.get(peerId.id) ?? null
  }

  public resetStorage (): void {
    this.storage.clear()
  }
}

const KeyCache = new Keycache()
export {
  KeyCache
}
