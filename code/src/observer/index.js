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
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
			val = newVal
      childOb = observe(newVal)
      dep.notify()
    }
  })
}