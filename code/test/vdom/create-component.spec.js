import Vue from "../../src/instance/index"
import { createComponent } from '../../src/vdom/create-component'

describe('create-component', () => {
  let vm
  beforeEach(done => {
    vm = new Vue({
      data () {
        msg: 'hello, my children'
      },
      render () {}
    }).$mount()
    done()
  })

  it('create a component basically', () => {
    const child = {
      name: 'child',
      props: ['msg'],
      render () {}
    }
    const init = jasmine.createSpy()
    const data = {
      props: { msg: 'hello world' },
      attrs: { id: 1 },
      staticAttrs: { class: 'foo' },
      hook: { init },
    }
    const vnode = createComponent(child, data, vm, vm)
    expect(vnode.tag).toMatch(/vue-component-[0-9]+-child/)
    expect(vnode.data.attrs).toEqual({ id: 1 })
    expect(vnode.data.staticAttrs).toEqual({ class: 'foo' })
    expect(vnode.componentOptions.propsData).toEqual({ msg: 'hello world' })
    expect(vnode.children).toBeUndefined()
    expect(vnode.text).toBeUndefined()
    expect(vnode.elm).toBeUndefined()
    expect(vnode.ns).toBeUndefined()
    expect(vnode.context).toEqual(vm)

    vnode.data.hook.init(vnode)
    expect(init.calls.argsFor(0)[0]).toBe(vnode)
  })

  it('not create a component when specified with falsy', () => {
    const vnode = createComponent(null, {}, vm, vm)
    expect(vnode).toBeUndefined()
  })

})