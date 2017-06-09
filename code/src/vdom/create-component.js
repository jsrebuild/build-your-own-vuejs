import {
  isUndef,
  isObject
} from '../util/index'

export function createComponent ( Ctor, data, context, children, tag){
  if (isUndef(Ctor)) {
    return
  }

  const baseCtor = context.$options._base

  // plain options object: turn it into a constructor
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor)
  }

  // resolve constructor options in case global mixins are applied after
  // component constructor creation
  // resolveConstructorOptions(Ctor)

  data = data || {}

  // // transform component v-model data into props & events
  // if (isDef(data.model)) {
  //   transformModel(Ctor.options, data)
  // }

  // extract props
  const propsData = Ctor.options.props

  // // functional component
  // if (isTrue(Ctor.options.functional)) {
  //   return createFunctionalComponent(Ctor, propsData, data, context, children)
  // }

  // // extract listeners, since these needs to be treated as
  // // child component listeners instead of DOM listeners
  // const listeners = data.on
  // // replace with listeners with .native modifier
  // data.on = data.nativeOn

  // if (isTrue(Ctor.options.abstract)) {
  //   // abstract components do not keep anything
  //   // other than props & listeners
  //   data = {}
  // }

  // merge component management hooks onto the placeholder node
  // mergeHooks(data)

  // return a placeholder vnode
  const name = Ctor.options.name || tag
  const vnode = new VNode(
    "vue-component-" + name,
    data, undefined, undefined, undefined, context,
    { Ctor, propsData, listeners, tag, children }
  )
  return vnode
}