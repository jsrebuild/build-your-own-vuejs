import * as nodeOps from './node-ops'
import { createPatchFunction } from 'core/vdom/patch'
// import baseModules from 'core/vdom/modules/index'
import platformModules from './modules/index'

// the directive module should be applied last, after all
// built-in modules have been applied.
const modules = platformModules

export const patch = createPatchFunction({ nodeOps, modules })
