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

Since this is a JavaScript project, and we'gonna use some fancy tools, the first thing to do is run `npm init` and set up some infomation about this project. 


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

We'll add some npm script for convinice. 

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

This test case tests wheather props on vm's data like `vm._data.a` are proxied to vm itself, like `vm.a`. This is one of Vue's litte tricks.

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
This is nothing exciting, just Vue construtor calling `_init`. So let's find out what `initMixin` do:


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

The instace method of Vue Class are injected in a mixin parttern. We'll find this mixin parttern quite common. Mixin is just a function that takes a construtor, add method to its prototype, and return the construtor.

So initMixin add `_init` method to `Vue.prototype`. And this method calls `initState` from `state.js`:

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

Finally, we got to the place where proxy takes place. `initState` calls `initData`, and `initData` loops all keys of `vm._data`, calls proxy on each value.

`proxy` define a property using the same key on vm, and this property has getter and setter, which manipulate `vm._data` for get/set.

So that's how `vm.a` is proxied to `vm._data.a`.

Run `npm run build` and `npm run test`. You should see something like this:

![success](http://cdn4.snapgram.co/images/2016/12/11/ScreenShot2016-12-12at2.02.17AM.png)

Bravo! You successfully bootstrapped your own Vuejs! Keep working!