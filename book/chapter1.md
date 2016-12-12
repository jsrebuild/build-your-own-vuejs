## Chapter1: Vuejs Overview

Vuejs is a simple yet powerful MVVM library. It helps us to build a modern user interface for the web.

By the time of writing, Vuejs has 36,312 stars on Github. And 230,250 monthly downloads on npm. Vuejs 2.0 brings in a lightweight virtual DOM implementation for render layer. This unlock more possibilities like server-side rendering and native component rendering.

Vuejs claims to be a progressive JavaScript framework. Though the core library of Vuejs is quite small. Vuejs has many accompanying tools & supporting libraries. So you can build large-scale application using the Vuejs ecosystem.


### Components of Vuejs internals

Let's get acquaintance with the core components of Vuejs internals. Vue internals falls into serval parts:

![Vue internal](https://occc3ev3l.qnssl.com/Vue%20source%20overview.png)


#### Instance lifecycle

A new Vue instance will go through several phases. Such as observing data, initializing events, compiling the template, and render. And you can register  lifecycle hooks that will be called in the specific phase.

#### Reactivity system

The so called *reactivity system* is where vue's data-view binding magic comes from. When you set vue instance's data, the view updated accordingly, and vice versa. 

Vue use `Object.defineProperty` to make data object's property reactive. Along with the famous *Observer Pattern* to link data change and view render together.


#### Virtual DOM

Virtual DOM is the tree representation of the actual DOM tree that lives in the memory as JavaScript Objects. 

When data changes, vue will render a brand new virtual DOM tree, and keep the old one. The virtual DOM module diff two trees and patch the change into the actual DOM tree.

Vue use [snabbdom](https://github.com/snabbdom/snabbdom) as the base of its virtual DOM implementation. And modify a bit to make it work with Vue's other component.

#### Compiler

The job of the compiler is to compile template into render functions(ASTs). It parses HTML along with Vue directives (Vue directives are just plain HTML attribute) and other entities into a tree. It also detects the maximum static sub trees (sub trees with no dynamic bindings) and hoists them out of the render. The HTML parser Vue uses is originally written by [John Resig](http://ejohn.org).

> We will not cover the implementation detail of the Compiler in this book. Since we can use build tools to compile vue template into render functions in build time, Compiler is not a part of vue runtime. And we can even write render functions directly, so Compiler is not an essential part to understand vue internals.


### Set up development environment

Before we can start building our own Vue.js, we need to set up a few things. Including module bundler and testing tools, since we will use a test-driven workflow.

Since this is a JavaScript project, and we'gonna use some fancy tools, the first thing to do is run `npm init` and set up some information about this project. 


#### Set up Rollup for module bundling

We will use Rollup for module bundling. [Rollup](http://rollupjs.org) is a JavaScript module bundler. It allows you to write your application or library as a set of modules – using modern ES2015 import/export syntax. And Vuejs use Rollup for module bundling too.

We gotta write a configuration for Rollup to make it work. Under root directory, touch `rollup.conf.js`:

```
export default {
  entry: 'src/instance/index.js',
  format: 'umd',
  moduleName: 'Vue',
  dest: 'dist/vue.js' 
};
```
And don't forget to run `npm install rollup rollup-watch --save-dev`.

#### Set up Karma and Jasmine for testing

Testing will require quite a few packages, run:

```
npm install karma jasmine karma-jasmine karma-chrome-launcher
 karma-rollup-plugin --save-dev
```

Under root directory, touch `karma.conf.js`:

```
module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    files: [
      './test/**/*.js'
    ],
    browsers: ['Chrome'],
    preprocessors: {
     './test/**/*.js': ['rollup']
    },
    rollupPreprocessor: {
      format: 'iife',
      sourceMap: 'inline'
    }
  })
}
```

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

We'll add some npm script for convenience. 

*package.json*

```
"scripts": {
   "build": "rollup -c",
   "watch": "rollup -c -w",
   "test": "karma start"
}
```

To bootstrap our own Vuejs, let's write our first test case.

*test/options/options.spec.js*

```
import Vue from "../src/instance/index";

describe('Proxy test', function() {
  it('should proxy vm._data.a = vm.a', function() {
  	var vm = new Vue({
  		data:{
  			a:2
  		}
  	})
    expect(vm.a).toEqual(2);
  });
});
```

This test case tests whether props on vm's data like `vm._data.a` are proxied to vm itself, like `vm.a`. This is one of Vue's little tricks.

So we can write our first line of real code now, in 

*src/instance/index.js*

```
import { initMixin } from './init'

function Vue (options) {
  this._init(options)
}

initMixin(Vue)

export default Vue
```
This is nothing exciting, just Vue constructor calling `this._init`. So let's find out how the `initMixin` fucntion work:


*src/instance/init.js*

```
import { initState } from './state'

export function initMixin (Vue) {
  Vue.prototype._init = function (options) {
  	var vm = this
  	vm.$options = options
  	initState(vm)
  }
}
```

The instance method of Vue Class are injected using a mixin pattern. We'll find this mixin pattern quite common when writing Vuejs's instance method later. Mixin is just a function that takes a constructor, add some methods to its prototype, and return the constructor.

So `initMixin` add `_init` method to `Vue.prototype`. And this method calls `initState` from `state.js`:

*src/instance/state.js*

```

export function initState(vm) {
  initData(vm)
}

function initData(vm) {
  var data = vm.$options.data
  vm._data = data
  // proxy data on instance
  var keys = Object.keys(data)

  var i = keys.length
  while (i--) {
    proxy(vm, keys[i])
  }
}

function proxy(vm, key) {
    Object.defineProperty(vm, key, {
      configurable: true,
      enumerable: true,
      get: function proxyGetter() {
        return vm._data[key]
      },
      set: function proxySetter(val) {
        vm._data[key] = val
      }
    })
}
```

Finally, we got to the place where proxy takes place. `initState` calls `initData`, and `initData` iterates all keys of `vm._data`, calls `proxy` on each value.

`proxy` define a property on `vm` using the same key, and this property has both getter and setter, which actually get/set data from `vm._data`.

So that's how `vm.a` is proxied to `vm._data.a`.

Run `npm run build` and `npm run test`. You should see something like this:

![success](http://cdn4.snapgram.co/images/2016/12/11/ScreenShot2016-12-12at2.02.17AM.png)

Bravo! You successfully bootstrapped your own Vuejs! Keep working!