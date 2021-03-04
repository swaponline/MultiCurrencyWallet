/**
 * Record is the base implementation of a record that can be used as the payload of a libp2p envelope.
 */
export interface Record {
  /**
   * signature domain.
   */
  domain: string;
  /**
   * identifier of the type of record
   */
  codec: Uint8Array;
  /**
   * Marshal a record to be used in an envelope.
   */
  marshal(): Uint8Array;
  /**
   * Verifies if the other provided Record is identical to this one.
   */
  equals(other: unknown): boolean
}
