import { initRender } from './render'
import { initState } from './state'
import { initLifecycle } from './lifecycle'
import { mergeOptions } from '../util/index'

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    var vm = this
    // vm.$options = options;
    console.log("xxx", vm.constructor.options)
    vm.$options = mergeOptions(
      resolveConstructorOptions(vm.constructor),
      options || {},
      vm
    )

    // should be in global api
    vm.$options._base = Vue

    initLifecycle(vm)
    initState(vm)
    initRender(vm)

    vm.$mount(options)
  }
}

export function resolveConstructorOptions(Ctor) {
  let options = Ctor.options
  // if (Ctor.super) {
  //   const superOptions = resolveConstructorOptions(Ctor.super)
  //   const cachedSuperOptions = Ctor.superOptions
  //   if (superOptions !== cachedSuperOptions) {
  //     // super option changed,
  //     // need to resolve new options.
  //     Ctor.superOptions = superOptions
  //     // check if there are any late-modified/attached options (#4976)
  //     const modifiedOptions = resolveModifiedOptions(Ctor)
  //     // update base extend options
  //     if (modifiedOptions) {
  //       extend(Ctor.extendOptions, modifiedOptions)
  //     }
  //     options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
  //     if (options.name) {
  //       options.components[options.name] = Ctor
  //     }
  //   }
  // }
  return options
}