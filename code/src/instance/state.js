import Watcher from '../observer/watcher'
import Dep from '../observer/dep'

import {
  observe
} from '../observer/index'

import {
  isReserved
} from '../util/index'

export function initState(vm) {
  vm._watchers = []
  //initProps(vm)
  //initMethods(vm)
  initData(vm)
  //initComputed(vm)
  //initWatch(vm)
}

function initData(vm) {
  var data = vm.$options.data
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}
  // proxy data on instance
  var keys = Object.keys(data)

  var i = keys.length
  while (i--) {
    proxy(vm, keys[i])
  }

  // observe data
  observe(data)
}

function getData(data, vm) {
  return data.call(vm, vm)
}

export function stateMixin(Vue) {

}

export function proxy(vm, key) {
  if (!isReserved(key)) {
    Object.defineProperty(vm, key, {
      configurable: true,
      enumerable: true,
      get: function proxyGetter() {
        return vm._data[key]
      },
      set: function proxySetter(val) {
        vm._data[key] = val
      }
    })
  }
}
