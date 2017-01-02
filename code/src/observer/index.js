import Dep from './dep'
import {
  def,
  hasOwn,
  hasProto,
  isObject
}
from '../util/index'
import { arrayMethods } from './array'

var arrayKeys = Object.getOwnPropertyNames(arrayMethods)

export function Observer(value) {
  this.value = value
  this.dep = new Dep()
  //this.walk(value)
  if(Array.isArray(value)){
    var augment = hasProto
        ? protoAugment
        : copyAugment
      augment(value, arrayMethods, arrayKeys)
    this.observeArray(value)
  }else{
    this.walk(value)
  }
  def(value, '__ob__', this)
}

Observer.prototype.walk = function(obj) {
  var keys = Object.keys(obj)
  for (var i = 0; i < keys.length; i++) {
    defineReactive(obj, keys[i], obj[keys[i]])
  }
}

Observer.prototype.observeArray = function(items) {
  for (let i = 0, l = items.length; i < l; i++) {
    observe(items[i])
  }
}

export function observe(value) {
  if (!isObject(value)) {
    return
  }
  var ob
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else {
    ob = new Observer(value)
  }
  return ob
}

export function defineReactive(obj, key, val) {
  var dep = new Dep()
  var childOb = observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      var value = val
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
        }
        // if (Array.isArray(value)) {
        //   dependArray(value)
        // }
      }
      return value
    },
    set: function reactiveSetter(newVal) {
      var value = val
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      val = newVal
      childOb = observe(newVal)
      dep.notify()
    }
  })
}

// helpers

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src) {
  /* eslint-disable no-proto */
  target.__proto__ = src
  /* eslint-enable no-proto */
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 *
 * istanbul ignore next
 */
function copyAugment (target, src, keys) {
  for (let i = 0, l = keys.length; i < l; i++) {
    var key = keys[i]
    def(target, key, src[key])
  }
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
export function set(obj, key, val) {
  // if (Array.isArray(obj)) {
  //   obj.length = Math.max(obj.length, key)
  //   obj.splice(key, 1, val)
  //   return val
  // }
  if (hasOwn(obj, key)) {
    obj[key] = val
    return
  }
  const ob = obj.__ob__
  if (!ob) {
    obj[key] = val
    return
  }
  defineReactive(ob.value, key, val)
  ob.dep.notify()
  return val
}

/**
 * Delete a property and trigger change if necessary.
 */
export function del(obj, key) {
  const ob = obj.__ob__
  if (!hasOwn(obj, key)) {
    return
  }
  delete obj[key]
  if (!ob) {
    return
  }
  ob.dep.notify()
}

function dependArray (value) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i]
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      dependArray(e)
    }
  }
}
