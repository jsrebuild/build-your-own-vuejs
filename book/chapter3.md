## Chapter3: Virtual DOM


### 3.1 A brief introduction to Virtual DOM


Virtual DOM is the an abstraction of DOM. We use a light weight JavaScript object to present a real DOM node. Each component's view structure can be expressed by a Virtual DOM tree. When the component render for the first time, we get the the Virtual DOM tree using the `render` function. The Virtual DOM tree is then transformed and inserted into the real DOM. And when the component's data has changed, we'll re-render to get a new the Virtual DOM tree, calculate the minimal differences(insertion, addition, deletion, movement) needed to transform the old Virtual DOM tree to the shape of the new one. Finally we apply these changes to the real DOM(The last two steps are called patching in most Virtual DOM implementation).

The reason why Vuejs use Virtual DOM rather than binding DOM manipulations directly to data changes is fwe can achieve cross-platform render by switching the backend of Virtual DOM. So Virtual DOM actually is not exactly an abstraction of DOM, it's an abstraction of the component's view's structure. We can use all kinds of backend to render the Virtual DOM tree, such as iOS and Android.

Besides, the abstraction layer provided by  Virtual DOM will made declarative programming style straightforward. 

We had a famous equation in declarative data-driven style front-end development:

`UI = render(state)` 

The render function takes the component state and produce DOM by apply the state with the Virtual DOM tree. So the Virtual DOM is a key infrastructure of declarative UI programming.


### 3.2 Virtual DOM and component system

Each virtual DOM node is the abstraction of a real DOM node. But how about a component? 

In Vuejs, a component has a corresponding virtual DOM node(`VNode` instance), this `VNode` instance is regarded as a placeholder for the component in the Virtual DOM tree. This placeholder `VNode` instance has only one children, the Virtual DOM node corresponding to the component's **root DOM** Node.

*should be a image here to visualize this problem*

### 3.3 `VNode` Class

### 3.4 `create-component` API

### 3.5 `create-element` API

### 3.6 Patching Virtual DOM

### 3.7 Connecting Vue and Virtual DOM

### 3.8 Warp up