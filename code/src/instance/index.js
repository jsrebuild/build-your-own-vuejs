import { initMixin } from './init'
import { lifecycleMixin } from './lifecycle'
import { stateMixin } from './state'
import { renderMixin } from './render'

function Vue (options) {
  this._init(options)
}

initMixin(Vue)
stateMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue