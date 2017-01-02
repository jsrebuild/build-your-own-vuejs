export function isReserved (str) {
  var c = (str + '').charCodeAt(0)
  return c === 0x24 || c === 0x5F
}

export function noop () {}

export function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

var hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

export function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

// can we use __proto__?
export var hasProto = '__proto__' in {}