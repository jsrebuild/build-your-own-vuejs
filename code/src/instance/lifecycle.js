import { noop } from '../util/index'
import Watcher from '../observer/watcher'

export function initLifecycle(vm) {
  vm._watcher = null
}

export function lifecycleMixin(Vue) {
  Vue.prototype._mount = function(el) {
  	var vm = this
    vm._watcher = new Watcher(vm, () => {
      console.log(vm.a + vm.b, "update!!!")
    }, noop)
  }
  Vue.prototype.$destroy = function() {

  }
}
