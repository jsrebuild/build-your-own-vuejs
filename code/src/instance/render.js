export function initRender (vm) {
  vm._mount(vm.$options.el)
}

export function renderMixin (Vue) {
  Vue.prototype.$nextTick = function (fn) {

  }
  Vue.prototype._render = function () {

  }
}