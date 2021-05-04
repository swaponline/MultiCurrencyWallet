/*
 Allows multiple extending
 */

const aggregation = (baseClass, ...mixins) => {

  const base = class _Combined extends baseClass {

    constructor(...args) {
      super(...args)

      mixins.forEach((mixin) => {
        mixin.prototype._constructor.call(this)
      })
    }
  }

  const copyProps = (target, source) => {
    Object.getOwnPropertyNames(source)
      //@ts-ignore
      .concat(Object.getOwnPropertySymbols(source))
      .forEach((prop) => {
        if (prop.match(/^(?:_?constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/)) {
          return
        }

        //@ts-ignore: strictNullChecks
        Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop))
      })
  }

  mixins.forEach((mixin) => {
    copyProps(base.prototype, mixin.prototype)
    copyProps(base, mixin)
  })

  return base
}


export default aggregation
