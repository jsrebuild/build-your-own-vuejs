import { noop } from '../util/index'
import Watcher from '../observer/watcher'

export function initLifecycle(vm) {
  vm._watcher = null
}

export function lifecycleMixin(Vue) {
	Vue.prototype._update = function (vnode) {

	}
  Vue.prototype.$mount = function(el) {

  	var vm = this
    vm._watcher = new Watcher(vm, function(){
      console.log(vm.a, "update!!!")
    }, noop)
  }
  Vue.prototype.$destroy = function() {

  }
}
