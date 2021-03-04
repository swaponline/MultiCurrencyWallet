/* Fall back from Symbol.asyncIterator to Symbol.iterator to a new symbol. */
const sym = (Symbol as unknown) as {asyncIterator: symbol}
const prop = Object.getOwnPropertyDescriptor(sym, "asyncIterator")
if (!prop) {
  sym.asyncIterator = Symbol.iterator || Symbol.for("Symbol.asyncIterator")
}
