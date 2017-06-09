import { initRender } from './render'
import { initState } from './state'
import { initLifecycle } from './lifecycle'

export function initMixin (Vue) {
  Vue.prototype._init = function (options) {
  	var vm = this
  	vm.$options = options

  	// should be in global api
  	vm.$options._base = Vue
  	
  	initLifecycle(vm)
  	initState(vm)
  	initRender(vm)

  	vm.$mount(options)
  }
}