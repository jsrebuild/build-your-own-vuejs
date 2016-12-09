## Chapter1: Vuejs Overview

Vuejs is a simple yet powerful MVVM library. It helps us to build modern user interface for the web.

**TODO: more on how awesome vue is, maybe some history of vue. And the purpose of writing this book.**

### Components of Vuejs internals

Vue internals falls into serval parts:

![Vue internal](https://occc3ev3l.qnssl.com/Vue%20source%20overview.png)

**TODO: change reactive to reactivity.**

#### Instance lifecycle

A new Vue instance will go through several phases. Such as observe data, init events, complie template, and render. And you can register  lifecycle hooks that will be called in specific phase.

#### Reactivity system

The so called *reactivity system* is where vue's data-view binding magic comes from. When you set vue instance's data, the view updated accordingly, and vice versa. 

Vue use `Object.defineProperty` to make data object's poperty reactive. Along with the famous *Observer Pattern* to link data change and view render together.


#### Virtual DOM

Virtual DOM is the tree represatation of the actual DOM tree that lives in the memory as JavaScript Objects. 

When data changes, vue will render a brand new vdom tree, and keep the old one. Vdom diff two trees and patch the change into the actual DOM tree.

Vue use [snabbdom](https://github.com/snabbdom/snabbdom) as the base of its vritual DOM implementation. And modify a bit to make it work with Vue's other compoenent.

#### Compiler

The job of compiler is to compile template into render functions(ASTs). It parses HTML along with Vue directives (Vue directives are just plain HTML attribute) and other entities into a tree. It also detects the maximum static sub trees (sub trees with no dynamic bindings) and hoists them out of the render. The HTML parser Vue uses is originally written by [John Resig](http://ejohn.org).

> We will not cover the implementaion detail of the Compiler in this book. Since we can use build tools to complie vue template into render functions in build time, Compiler is not a part of vue runtime. And we can even write render functions directly, so Compiler is not an essential part to understand vue internals.


### Set up development environment

Before we can start building our own Vue.js, we need to set up a few things. Including module bundler and testing tools, since we will use a test-driven workflow.


#### Set up Rollup for module bundling

We will use Rollup for module bundling. [Rollup](http://rollupjs.org) is a JavaScript module bundler. It allows you to write your application or library as a set of modules – using modern ES2015 import/export syntax. And vue use Rollup for module bundling too.

We gotta write a configuration for Rollup to make it work. Under root directory, touch `rollup.conf.js`:

```
export default {
  entry: 'src/instance/index.js',
  format: 'umd',
  moduleName: 'Vue',
  dest: 'dist/vue.js' 
};
```

#### Set up Karma and Jasmine for testing



#### Directory structure

```
- package.json
- rollup.conf.js
- node_modules
- dist
- test
- src
	- observer
	- instance
	- util
	- vdom

```


### Bootstrapping

set up basic entry, write a simple test

`npm run watch`

`npm run test`

//img of test OK

yeah!


