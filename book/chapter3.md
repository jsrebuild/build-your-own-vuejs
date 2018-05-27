## Chapter3: Virtual DOM


### 3.1 A brief introduction to Virtual DOM


Virtual DOM is the an abstraction of DOM. We use a light weight JavaScript object to present a real DOM node. Each component's view structure can be expressed by a Virtual DOM tree. When the component render for the first time, we get the the Virtual DOM tree using the `render` function. The Virtual DOM tree is then transformed and inserted into the real DOM. And when the component's data has changed, we'll re-render to get a new the Virtual DOM tree, calculate the minimal differences(insertion, addition, deletion, movement) needed to transform the old Virtual DOM tree to the shape of the new one. Finally we apply these changes to the real DOM(The last two steps are called patching in most Virtual DOM implementation).

The reason why Vuejs use Virtual DOM rather than binding DOM manipulations directly to data changes is fwe can achieve cross-platform render by switching the backend of Virtual DOM. So Virtual DOM actually is not exactly an abstraction of DOM, it's an abstraction of the component's view's structure. We can use all kinds of backend to render the Virtual DOM tree, such as iOS and Android.

Besides, the abstraction layer provided by  Virtual DOM will made declarative programming style straightforward. 

We had a famous equation in declarative data-driven style front-end development:

`UI = render(state)` 

The render function takes the component state and produce DOM by apply the state with the Virtual DOM tree. So the Virtual DOM is a key infrastructure of declarative UI programming.

### 3.2 How does Vue transform template into Virtual DOM

[Vue's official documentation on render function](https://vuejs.org/v2/guide/render-function.html) is highly recommended. You **should** read this to understand that Vue's template is really a syntactic sugar underneath.

The template below:

```
<div>
  I'm a template!
</div> 
```

Will be compiled into:

```
function anonymous(
) {
  with(this){return _c('div',[_v("I'm a template!\n")])}
}
```

`_c` is the alias for `createElement`. This API create a Virtual DOM node instance. And we can pass an array of children nodes to `createElement`, so the result of the render function will be a tree of Virtual DOM node.

So Vue's template is compiled into render function in build time ( With the help from vue-loader ). When Vue re-render the UI, the render fucntion is called. And it returns a new Virtual DOM tree.


### 3.3 Virtual DOM and the component system

Each virtual DOM node is an abstraction of a real DOM node. But how about a component? 

In Vuejs, a component has a corresponding virtual DOM node(`VNode` instance), this `VNode` instance is regarded as a placeholder for the component in the Virtual DOM tree. This placeholder `VNode` instance has only one children, the Virtual DOM node corresponding to the component's **root DOM** Node.

*should be a image here to visualize this problem*

### 3.4 `VNode` Class

We need to define the structure for the `VNode` Class first. 

*src/vdom/vnode.js*

```
export default function VNode(tag, data, children, text, elm, context, componentOptions) {
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text
    this.elm = elm
    this.context = context
    this.key = data && data.key
    this.componentOptions = componentOptions
    this.componentInstance = undefined
    this.parent = undefined
    this.isComment = false
}
```

Here we define `VNode`'s attributes using a constructor function. A Virtual DOM Node has some DOM-related attributes like tag, text and ns. And it also has Vue component related infomation like componentOptions and componentInstance. 

The children attribute is a pointer pointing to the children of the node, and the parent attribute point to the parent of that node. You know it, Virtual DOM is a tree.

The most useful attribute for a `VNode` is the data attribute. It has all the props, directives, event handlers, class, and styles you defined in your template stored.


### 3.5 `create-element` API

We're gonna implement the famous `h` function in Vue's render function!

> JSX use `h` as the alias for `createElement`. Vue use `_c` instead.

Let's write the test case for `createElement`:

*test/vdom/create-element.spec.js*

```
import Vue from "src/index"
import { createEmptyVNode } from 'src/vdom/vnode'

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
```

The tag passed to `createElement` should be one of:

+ platform built-in element's ( reserved tag ) tag name 
+ Vue component's tag name
+ custom element's ( Web Component ) tag name
+ null 

The `createElement` function should handle those situations. For platform built-in element and custom element, we just render the origin tag. For Vue component, we create a Vue component Node, this API will be implement in the next section. For null, we return a empty VNode.

The implementation is pretty straightforward:

```
import VNode, { createEmptyVNode } from "./vnode";
import config from "../config";
import { createComponent } from "./create-component";

import {
  isDef,
  isUndef,
  isTrue,
  isPrimitive,
  resolveAsset
} from "../util/index";

export function createElement(
  context,
  tag,
  data,
  children
) {
  let vnode, ns;
  if (typeof tag === "string") {
    let Ctor;
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      vnode = new VNode(
        config.parsePlatformTagName(tag),
        data,
        children,
        undefined,
        undefined,
        context
      );
    } else if (
      isDef((Ctor = resolveAsset(context.$options, "components", tag)))
    ) {
      // component
      vnode = createComponent(Ctor, data, context, children, tag);
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(tag, data, children, undefined, undefined, context);
    }
  } else {
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children);
  }
  if (!isDef(vnode)) {
    return createEmptyVNode();
  }
  return vnode;
}
```

### 3.6 `create-component` API

> Pre-compose-summary: Create-component implement the idea introduced in section 3.3. That is, create a placeholder VNode for a Vue component.


### 3.7 Patching Virtual DOM

> Pre-compose-summary: Patch is the key fucntion for VDOM module. Introduce the function of patching and the basic flow for patching.

### 3.8 The hook mechanism and the patch lifecycle

> Pre-compose-summary: Introduce the lifecycle for patching: init, create, insert, prepatch, postpatch, update, remove, destroy. And the VDOM plugin mechanism based on hooks.

### 3.9 Patching children

> Pre-compose-summary: The MAGICAL DIFFING Algorithm

### 3.10 Connecting Vue and Virtual DOM

> Pre-compose-summary: Call render when watcher is notified

### 3.11 Warp up