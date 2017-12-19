import { initExtend } from './extend'
import { ASSET_TYPES } from '../shared/constants'
import { extend } from '../shared/util'

export function initGlobalAPI (Vue) {
  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue

  // if (!Vue.options.components) {
  //   Vue.options.components = {}
  // }

  initExtend(Vue)
}