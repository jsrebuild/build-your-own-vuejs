import Vue  from './instance/index'
import { initGlobalAPI } from './global-api/index'

initGlobalAPI(Vue)

Vue.version = '__VERSION__'

export default Vue