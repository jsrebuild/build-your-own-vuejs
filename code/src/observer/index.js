import Dep from './dep'

import {
	def,
  hasOwn,
  isObject
} from '../util/index'

export function Observer(value) {
  this.value = value
  this.dep = new Dep()
	this.walk(value)
	def(value, '__ob__', this)
}

Observer.prototype.walk = function(obj) {
  var keys = Object.keys(obj)
  for (var i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]])
  }
}

export function observe (value){
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

export function defineReactive (obj, key, val) {
  var dep = new Dep()
  var childOb = observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
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
    set: function reactiveSetter (newVal) {
      var value =  val
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
			val = newVal
      childOb = observe(newVal)
      dep.notify()
    }
  })
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
export function set (obj, key, val) {
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
export function del (obj, key) {
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
