import * as $protobuf from "protobufjs";
/** Namespace pb. */
export namespace pb {

  /** Properties of a NoiseHandshakePayload. */
  interface INoiseHandshakePayload {

    /** NoiseHandshakePayload identityKey */
    identityKey?: (Uint8Array|null);

    /** NoiseHandshakePayload identitySig */
    identitySig?: (Uint8Array|null);

    /** NoiseHandshakePayload data */
    data?: (Uint8Array|null);
  }

  /** Represents a NoiseHandshakePayload. */
  class NoiseHandshakePayload implements INoiseHandshakePayload {

    /**
         * Constructs a new NoiseHandshakePayload.
         * @param [properties] Properties to set
         */
    constructor(properties?: pb.INoiseHandshakePayload);

    /** NoiseHandshakePayload identityKey. */
    public identityKey: Uint8Array;

    /** NoiseHandshakePayload identitySig. */
    public identitySig: Uint8Array;

    /** NoiseHandshakePayload data. */
    public data: Uint8Array;

    /**
         * Creates a new NoiseHandshakePayload instance using the specified properties.
         * @param [properties] Properties to set
         * @returns NoiseHandshakePayload instance
         */
    public static create(properties?: pb.INoiseHandshakePayload): pb.NoiseHandshakePayload;

    /**
         * Encodes the specified NoiseHandshakePayload message. Does not implicitly {@link pb.NoiseHandshakePayload.verify|verify} messages.
         * @param message NoiseHandshakePayload message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
    public static encode(message: pb.INoiseHandshakePayload, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
         * Encodes the specified NoiseHandshakePayload message, length delimited. Does not implicitly {@link pb.NoiseHandshakePayload.verify|verify} messages.
         * @param message NoiseHandshakePayload message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
    public static encodeDelimited(message: pb.INoiseHandshakePayload, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
         * Decodes a NoiseHandshakePayload message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns NoiseHandshakePayload
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.NoiseHandshakePayload;

    /**
         * Decodes a NoiseHandshakePayload message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns NoiseHandshakePayload
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.NoiseHandshakePayload;

    /**
         * Verifies a NoiseHandshakePayload message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
         * Creates a NoiseHandshakePayload message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns NoiseHandshakePayload
         */
    public static fromObject(object: { [k: string]: any }): pb.NoiseHandshakePayload;

    /**
         * Creates a plain object from a NoiseHandshakePayload message. Also converts values to other types if specified.
         * @param message NoiseHandshakePayload
         * @param [options] Conversion options
         * @returns Plain object
         */
    public static toObject(message: pb.NoiseHandshakePayload, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
         * Converts this NoiseHandshakePayload to JSON.
         * @returns JSON object
         */
    public toJSON(): { [k: string]: any };
  }
}
