import Vue from "../../src/index"
import { createEmptyVNode } from '../../src/vdom/vnode'

describe('create-element', () => {
  it('render vnode with basic reserved tag using createElement', () => {
    const vm = new Vue({
      data: { msg: 'hello world' }
    })
    const h = vm.$createElement
    const vnode = h('p', {})
    expect(vnode.tag).toBe('p')
    expect(vnode.data).toEqual({})
    expect(vnode.children).toBeUndefined()
    expect(vnode.text).toBeUndefined()
    expect(vnode.elm).toBeUndefined()
    expect(vnode.ns).toBeUndefined()
    expect(vnode.context).toEqual(vm)
  })

  it('render vnode with component using createElement', () => {
    const vm = new Vue({
      data: { message: 'hello world' },
      components: {
        'my-component': {
          props: ['msg']
        }
      }
    })
    const h = vm.$createElement
    const vnode = h('my-component', { props: { msg: vm.message }})
    expect(vnode.tag).toMatch(/vue-component-[0-9]+/)
    expect(vnode.componentOptions.propsData).toEqual({ msg: vm.message })
    expect(vnode.children).toBeUndefined()
    expect(vnode.text).toBeUndefined()
    expect(vnode.elm).toBeUndefined()
    expect(vnode.ns).toBeUndefined()
    expect(vnode.context).toEqual(vm)
  })

  it('render vnode with custom tag using createElement', () => {
    const vm = new Vue({
      data: { msg: 'hello world' }
    })
    const h = vm.$createElement
    const tag = 'custom-tag'
    const vnode = h(tag, {})
    expect(vnode.tag).toBe('custom-tag')
    expect(vnode.data).toEqual({})
    expect(vnode.children).toBeUndefined()
    expect(vnode.text).toBeUndefined()
    expect(vnode.elm).toBeUndefined()
    expect(vnode.ns).toBeUndefined()
    expect(vnode.context).toEqual(vm)
    expect(vnode.componentOptions).toBeUndefined()
  })

  it('render empty vnode with falsy tag using createElement', () => {
    const vm = new Vue({
      data: { msg: 'hello world' }
    })
    const h = vm.$createElement
    const vnode = h(null, {})
    expect(vnode).toEqual(createEmptyVNode())
  })

})
