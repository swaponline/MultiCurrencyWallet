'use strict'

const { nanoid } = require('nanoid')
const { utf8Encoder, utf8Decoder } = require('./utils')
const TextDecoder = require('ipfs-utils/src/text-decoder')

const symbol = Symbol.for('@ipfs/interface-datastore/key')
const pathSepS = '/'
const pathSepB = utf8Encoder.encode(pathSepS)
const pathSep = pathSepB[0]

/**
 * A Key represents the unique identifier of an object.
 * Our Key scheme is inspired by file systems and Google App Engine key model.
 * Keys are meant to be unique across a system. Keys are hierarchical,
 * incorporating more and more specific namespaces. Thus keys can be deemed
 * 'children' or 'ancestors' of other keys:
 * - `new Key('/Comedy')`
 * - `new Key('/Comedy/MontyPython')`
 * Also, every namespace can be parametrized to embed relevant object
 * information. For example, the Key `name` (most specific namespace) could
 * include the object type:
 * - `new Key('/Comedy/MontyPython/Actor:JohnCleese')`
 * - `new Key('/Comedy/MontyPython/Sketch:CheeseShop')`
 * - `new Key('/Comedy/MontyPython/Sketch:CheeseShop/Character:Mousebender')`
 *
 */
class Key {
  /**
   * @param {string | Uint8Array} s
   * @param {boolean} [clean]
   */
  constructor (s, clean) {
    if (typeof s === 'string') {
      this._buf = utf8Encoder.encode(s)
    } else if (s instanceof Uint8Array) {
      this._buf = s
    } else {
      throw new Error('Invalid key, should be String of Uint8Array')
    }

    if (clean == null) {
      clean = true
    }

    if (clean) {
      this.clean()
    }

    if (this._buf.byteLength === 0 || this._buf[0] !== pathSep) {
      throw new Error('Invalid key')
    }
  }

  /**
   * Convert to the string representation
   *
   * @param {string} [encoding='utf8'] - The encoding to use.
   * @returns {string}
   */
  toString (encoding = 'utf8') {
    if (encoding === 'utf8' || encoding === 'utf-8') {
      return utf8Decoder.decode(this._buf)
    }

    return new TextDecoder(encoding).decode(this._buf)
  }

  /**
   * Return the Uint8Array representation of the key
   *
   * @returns {Uint8Array}
   */
  uint8Array () {
    return this._buf
  }

  get [symbol] () {
    return true
  }

  /**
   * Return string representation of the key
   *
   * @returns {string}
   */
  get [Symbol.toStringTag] () {
    return `Key(${this.toString()})`
  }

  /**
   * Constructs a key out of a namespace array.
   *
   * @param {Array<string>} list - The array of namespaces
   * @returns {Key}
   *
   * @example
   * ```js
   * Key.withNamespaces(['one', 'two'])
   * // => Key('/one/two')
   * ```
   */
  static withNamespaces (list) {
    return new Key(list.join(pathSepS))
  }

  /**
   * Returns a randomly (uuid) generated key.
   *
   * @returns {Key}
   *
   * @example
   * ```js
   * Key.random()
   * // => Key('/f98719ea086343f7b71f32ea9d9d521d')
   * ```
   */
  static random () {
    return new Key(nanoid().replace(/-/g, ''))
  }

  /**
   * Cleanup the current key
   *
   * @returns {void}
   */
  clean () {
    if (!this._buf || this._buf.byteLength === 0) {
      this._buf = pathSepB
    }

    if (this._buf[0] !== pathSep) {
      const bytes = new Uint8Array(this._buf.byteLength + 1)
      bytes.fill(pathSep, 0, 1)
      bytes.set(this._buf, 1)
      this._buf = bytes
    }

    // normalize does not remove trailing slashes
    while (this._buf.byteLength > 1 && this._buf[this._buf.byteLength - 1] === pathSep) {
      this._buf = this._buf.subarray(0, -1)
    }
  }

  /**
   * Check if the given key is sorted lower than ourself.
   *
   * @param {Key} key - The other Key to check against
   * @returns {boolean}
   */
  less (key) {
    const list1 = this.list()
    const list2 = key.list()

    for (let i = 0; i < list1.length; i++) {
      if (list2.length < i + 1) {
        return false
      }

      const c1 = list1[i]
      const c2 = list2[i]

      if (c1 < c2) {
        return true
      } else if (c1 > c2) {
        return false
      }
    }

    return list1.length < list2.length
  }

  /**
   * Returns the key with all parts in reversed order.
   *
   * @returns {Key}
   *
   * @example
   * ```js
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').reverse()
   * // => Key('/Actor:JohnCleese/MontyPython/Comedy')
   * ```
   */
  reverse () {
    return Key.withNamespaces(this.list().slice().reverse())
  }

  /**
   * Returns the `namespaces` making up this Key.
   *
   * @returns {Array<string>}
   */
  namespaces () {
    return this.list()
  }

  /** Returns the "base" namespace of this key.
   *
   * @returns {string}
   *
   * @example
   * ```js
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').baseNamespace()
   * // => 'Actor:JohnCleese'
   * ```
   */
  baseNamespace () {
    const ns = this.namespaces()
    return ns[ns.length - 1]
  }

  /**
   * Returns the `list` representation of this key.
   *
   * @returns {Array<string>}
   *
   * @example
   * ```js
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').list()
   * // => ['Comedy', 'MontyPythong', 'Actor:JohnCleese']
   * ```
   */
  list () {
    return this.toString().split(pathSepS).slice(1)
  }

  /**
   * Returns the "type" of this key (value of last namespace).
   *
   * @returns {string}
   *
   * @example
   * ```js
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').type()
   * // => 'Actor'
   * ```
   */
  type () {
    return namespaceType(this.baseNamespace())
  }

  /**
   * Returns the "name" of this key (field of last namespace).
   *
   * @returns {string}
   *
   * @example
   * ```js
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').name()
   * // => 'JohnCleese'
   * ```
   */
  name () {
    return namespaceValue(this.baseNamespace())
  }

  /**
   * Returns an "instance" of this type key (appends value to namespace).
   *
   * @param {string} s - The string to append.
   * @returns {Key}
   *
   * @example
   * ```js
   * new Key('/Comedy/MontyPython/Actor').instance('JohnClesse')
   * // => Key('/Comedy/MontyPython/Actor:JohnCleese')
   * ```
   */
  instance (s) {
    return new Key(this.toString() + ':' + s)
  }

  /**
   * Returns the "path" of this key (parent + type).
   *
   * @returns {Key}
   *
   * @example
   * ```js
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').path()
   * // => Key('/Comedy/MontyPython/Actor')
   * ```
   */
  path () {
    let p = this.parent().toString()
    if (!p.endsWith(pathSepS)) {
      p += pathSepS
    }
    p += this.type()
    return new Key(p)
  }

  /**
   * Returns the `parent` Key of this Key.
   *
   * @returns {Key}
   *
   * @example
   * ```js
   * new Key("/Comedy/MontyPython/Actor:JohnCleese").parent()
   * // => Key("/Comedy/MontyPython")
   * ```
   */
  parent () {
    const list = this.list()
    if (list.length === 1) {
      return new Key(pathSepS)
    }

    return new Key(list.slice(0, -1).join(pathSepS))
  }

  /**
   * Returns the `child` Key of this Key.
   *
   * @param {Key} key - The child Key to add
   * @returns {Key}
   *
   * @example
   * ```js
   * new Key('/Comedy/MontyPython').child(new Key('Actor:JohnCleese'))
   * // => Key('/Comedy/MontyPython/Actor:JohnCleese')
   * ```
   */
  child (key) {
    if (this.toString() === pathSepS) {
      return key
    } else if (key.toString() === pathSepS) {
      return this
    }

    return new Key(this.toString() + key.toString(), false)
  }

  /**
   * Returns whether this key is a prefix of `other`
   *
   * @param {Key} other - The other key to test against
   * @returns {boolean}
   *
   * @example
   * ```js
   * new Key('/Comedy').isAncestorOf('/Comedy/MontyPython')
   * // => true
   * ```
   */
  isAncestorOf (other) {
    if (other.toString() === this.toString()) {
      return false
    }

    return other.toString().startsWith(this.toString())
  }

  /**
   * Returns whether this key is a contains another as prefix.
   *
   * @param {Key} other - The other Key to test against
   * @returns {boolean}
   *
   * @example
   * ```js
   * new Key('/Comedy/MontyPython').isDecendantOf('/Comedy')
   * // => true
   * ```
   */
  isDecendantOf (other) {
    if (other.toString() === this.toString()) {
      return false
    }

    return this.toString().startsWith(other.toString())
  }

  /**
   * Checks if this key has only one namespace.
   *
   * @returns {boolean}
   *
   */
  isTopLevel () {
    return this.list().length === 1
  }

  /**
   * Concats one or more Keys into one new Key.
   *
   * @param {Array<Key>} keys - The array of keys to concatenate
   * @returns {Key}
   */
  concat (...keys) {
    return Key.withNamespaces([...this.namespaces(), ...flatten(keys.map(key => key.namespaces()))])
  }

  /**
   * Check if value is a Key instance
   *
   * @param {any} value - Value to check
   * @returns {value is Key}
   */
  static isKey (value) {
    return value instanceof Key || Boolean(value && value[symbol])
  }
}

/**
 * The first component of a namespace. `foo` in `foo:bar`
 *
 * @param {string} ns
 * @returns {string}
 */
function namespaceType (ns) {
  const parts = ns.split(':')
  if (parts.length < 2) {
    return ''
  }
  return parts.slice(0, -1).join(':')
}

/**
 * The last component of a namespace, `baz` in `foo:bar:baz`.
 *
 * @param {string} ns
 * @returns {string}
 */
function namespaceValue (ns) {
  const parts = ns.split(':')
  return parts[parts.length - 1]
}

/**
 * Flatten array of arrays (only one level)
 *
 * @template T
 * @param {Array<T|T[]>} arr
 * @returns {T[]}
 */
function flatten (arr) {
  return /** @type {T[]} */([]).concat(...arr)
}

module.exports = Key
