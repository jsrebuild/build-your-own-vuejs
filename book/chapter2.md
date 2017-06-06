## Chapter2: Reactivity system


Vue's reactivity system makes data binding between model and view  simple and intuitive. Data is defined as a plain JavaScript object. When data changes, the view updated automatically to reflex the lastest state. It works like a charm.

Under the hood, Vuejs will walk through all of the data's properties and convert them to getter/setters using `Object.defineProperty`. 

Each primitive key-value pair in data has an `Observer` instance. The observer will send a signal for watchers who subscribed the value change event earlier.

And each `Vue` instance has a `Watcher` instance which records any properties “touched” during the component’s render as dependencies. When data changes, watcher will re-collect  dependencies and run the callback passed when the watcher is initialized.

So how do observer notify watcher for data change? Observer pattern to the rescue! We define a new class called `Dep`, which means "Dependence", to serve as a mediator. Observer instance has a reference for all the deps it needs to notify when data changes. And each dep instance knows which watcher it needs to update. 

That's basically how the reactivity system works from a 100,000 feet view. In the next few sections, we'll have a closer look at the implementation details of the reactivity system.



### Dep

The implemetation of `Dep` is stratforwd. Each dep instance has a uid to for identification. The `subs` array records all watchers subscribe to this dep instance. `Dep.prototype.notify` call each subscribers' update method in `subs` array. `Dep.prototype.depend` is used for dependency collecttion during watcher's re-evaluation. We'll come to watchers later. For now you should only konw that `Dep.target` is the watcher instance being re-evaluated at the moment. Since this property is a static, so `Dep.target` works globally and points to one watcher at a time.

*src/observer/dep.js*

```
var  uid = 0

// Dep contructor
export default function Dep(argument) {
  this.id = uid++
  this.subs = []
}

Dep.prototype.addSub = function(sub) {
  this.subs.push(sub)
}

Dep.prototype.removeSub = function(sub) {
  remove(this.subs, sub)
}

Dep.prototype.depend = function() {
  if (Dep.target) {
    Dep.target.addDep(this)
  }
}

Dep.prototype.notify = function() {
  var subs = this.subs.slice()
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update()
  }
}

Dep.target = null
```

### Observer basics


We start by a boilerplate like this:

*src/observer/index.js*

```
// Observer constructor
export function Observer(value) {

}

// API for observe value
export function observe (value){

}
```
Before we implement `Observer`, we'll write a test first.

*test/observer/observer.spec.js*

```
import {
  Observer,
  observe
} from "../../src/observer/index"
import Dep from '../../src/observer/dep'

describe('Observer test', function() {
  it('observing object prop change', function() {
  	const obj = { a:1, b:{a:1}, c:NaN}
    observe(obj)
    // mock a watcher!
    const watcher = {
      deps: [],
      addDep (dep) {
        this.deps.push(dep)
        dep.addSub(this)
      },
      update: jasmine.createSpy()
    }
    // observing primitive value
    Dep.target = watcher
    obj.a
    Dep.target = null
    expect(watcher.deps.length).toBe(1) // obj.a
    obj.a = 3
    expect(watcher.update.calls.count()).toBe(1)
    watcher.deps = []
  });

});
```

First, we define a plain JavaScript object `obj` as data. Then we use `observe` function to make data reactive. Since we haven't implement watcher yet, we need to mock a watcher. A watcher has a `deps` array for dependency bookkeeping. The `update` method will be called when data changes. We'll come to `addDep` later this section.

Here we use a jasmine's spy function as a placeholder. A spy function has no real functionality. It keeps information like how many times it's been called and the parameters being passed in when called.

Then we set the global `Dep.target` to `watcher`, and get `obj.a.b`. If the data is reactive, then the watcher's update method will be called.

So let's foucus on the `observe` fucntion first. The code is listed below. It first checks if the value is an object. If so, it then checks if this value already has a `Observer` instance attched by checking its `__ob__` property.

If there is no exsiting `Observer` instance, it will initiate a new `Observer` instance with the value and return it.

*src/observer/index.js*

```
import {
  hasOwn,
  isObject
}
from '../util/index'

export function observe (value){
  if (!isObject(value)) {
    return
  }
  var ob
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else {
    ob = new Observer(value)
  }
  return ob
}
```

Here, we need a little utility function `hasOwn`, which is a simple warpper for `Object.prototype.hasOwnProperty`:

*src/util/index.js*

```
var hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}
```

And another utility function `isObject`:

*src/util/index.js*

```
···
export function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}
```

Now it's time to look at the `Observer` constructor. It will init a `Dep` instance, and it calls `walk` with the value. And it attachs observer to `value` as `__ob__ ` property.

*src/observer/index.js*

```
import {
  def, //new
  hasOwn,
  isObject
}
from '../util/index'

export function Observer(value) {
  this.value = value
  this.dep = new Dep()
  this.walk(value)
  def(value, '__ob__', this)
}
```

`def` here is a new utility function which define property for object key using `Object.defineProperty()` API.

*src/util/index.js*

```
···
export function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}
```

The `walk` method just iterate over the object, call each value with `defineReactive`.

*src/observer/index.js*

```
Observer.prototype.walk = function(obj) {
  var keys = Object.keys(obj)
  for (var i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]])
  }
}
```


`defineReactive` is where `Object.defineProperty` comes into play. 

*src/observer/index.js*

```
export function defineReactive (obj, key, val) {
  var dep = new Dep()
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      var value = val
      if (Dep.target) {
        dep.depend()
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      var value =  val
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
	   val = newVal
      dep.notify()
    }
  })
}
```

The `reactiveGetter` function checks if `Dep.target` exists, which means the getter is triggered during a watcher dependency re-collection. When that happens, we add dependency by calling `dep.depend()`. `dep.depend()` actually calls `Dep.target.addDep(dep)`. Since `Dep.target` is a watcher, is equals `watcher.addDep(dep)`. Let's see what `addDep`do:

```
addDep (dep) {
   this.deps.push(dep)
   dep.addSub(this)
}
``` 

It pushes `dep` to watcher's `deps` array. It also pushes the target watcher to the dep's `subs` array. So that's how dependencies are tracked.

The `reactiveSetter` function simply set the new value if the new value is not the same with the old one. And it notifies watcher to update by calling `dep.notify()`. Let's review the previous Dep section:

```
Dep.prototype.notify = function() {
  var subs = this.subs.slice()
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update()
  }
}
```
`Dep.prototype.notify` calls each watcher's `update` methods in the `subs` array. Well, yes, the watchers're the same watchers that were pushed into the `subs` array during `Dep.target.addDep(dep)`. So things're all connected. 

Let's try `npm run test`. The test case we wrote earilier should all pass.

### Observing nested object

We can only observe simple plain object with primitive values at this time. So in the section we'll add support for observing non-primitive value, like object.

First we're gonna modify the test case a bit:

*test/observer/observer.spec.js*

```

describe('Observer test', function() {
  it('observing object prop change', function() {
	···
    // observing non-primitive value
    Dep.target = watcher
    obj.b.a
    Dep.target = null
    expect(watcher.deps.length).toBe(3) // obj.b + b + b.a
    obj.b.a = 3
    expect(watcher.update.calls.count()).toBe(1)
    watcher.deps = []
  });
```

`obj.b` is a object itself. So we check if the value change on `obj.b` is notified to see if non-primitive value observing is supported.

The solution is straightforward, we'll recursively call `observer` function on `val`. If `val` is not an object, the `observer` will return. So when we use `defineReactive` to observe a key-value pair, we keep call `observe` fucntion and keep the return value in `childOb`.

*src/observer/index.js*

```
export function defineReactive (obj, key, val) {
  var dep = new Dep()
  var childOb = observe(val) // new
  Object.defineProperty(obj, key, {
    ···
  })
}
```

The reason that we need to keep the reference of child observer is we need to re-collect dependencies on child objects when getter is called:

*src/observer/index.js*

```
···
get: function reactiveGetter () {
      var value = val
      if (Dep.target) {
        dep.depend()
        // re-collect for childOb
        if (childOb) {
          childOb.dep.depend()
        }
      }
      return value
    }
···
```

And we also need to re-observe child value when setter is called:

*src/observer/index.js*

```
···
set: function reactiveSetter (newVal) {
      var value =  val
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
	  val = newVal
      childOb = observe(newVal) //new
      dep.notify()
    }
···
```

### Observing set/delete of data

Vue has some caveats on observing data change. Vue cannot detect property **addition** or **deletion** due to the way Vue handles data change. Data change will only be detected when getter or setter is called, but set/delete of data will call neither getter or setter.

However, it’s possible to add reactive properties to a nested object using the `Vue.set(object, key, value)` method. And delete reactive properties using the `Vue.delete(object, key, value)` method.

Let's write a test case for this, as always:

*test/observer/observer.spec.js*

```
import {
  Observer,
  observe,
  set as setProp, //new
  del as delProp  //new
}
from "../../src/observer/index"
import {
  hasOwn,
  isObject
}
from '../util/index' //new

describe('Observer test', function() {
  // new test case
  it('observing set/delete', function() {
    const obj1 = {
      a: 1
    }
    // should notify set/delete data
    const ob1 = observe(obj1)
    const dep1 = ob1.dep
    spyOn(dep1, 'notify')
    setProp(obj1, 'b', 2)
    expect(obj1.b).toBe(2)
    expect(dep1.notify.calls.count()).toBe(1)
    delProp(obj1, 'a')
    expect(hasOwn(obj1, 'a')).toBe(false)
    expect(dep1.notify.calls.count()).toBe(2)
    // set existing key, should be a plain set and not
    // trigger own ob's notify
    setProp(obj1, 'b', 3)
    expect(obj1.b).toBe(3)
    expect(dep1.notify.calls.count()).toBe(2)
    // should ignore deleting non-existing key
    delProp(obj1, 'a')
    expect(dep1.notify.calls.count()).toBe(3)
  });
  ···
}
```

We add a new test case called `observing set/delete` in `Observer test`.

Now we can implement these two methods:
  
*src/observer/index.js*

```
export function set (obj, key, val) {
  if (hasOwn(obj, key)) {
    obj[key] = val
    return
  }
  const ob = obj.__ob__
  if (!ob) {
    obj[key] = val
    return
  }
  defineReactive(ob.value, key, val)
  ob.dep.notify()
  return val
}

export function del (obj, key) {
  const ob = obj.__ob__
  if (!hasOwn(obj, key)) {
    return
  }
  delete obj[key]
  if (!ob) {
    return
  }
  ob.dep.notify()
}
```

The function `set` will first check if the key exists. If the key exists, we simply give it a new value and return. Then we'll check if this object is reactive using `obj.__ob__`, if not, we'll return. If the key is not there yet, we'll make this key-value pair reactive using `defineReactive`, and call `ob.dep.notify()` to notify the obj's value is changed.

The function `del` is almost the same expect it delete value using `delete` operator.

### Observing array 

Our implemetation has one flawn yet, it can't observe array mutaion. Since accessing array element using subscrpt syntax will not trigger getter. So the old school getter/setter is not suitable for array change dectection.

In order to watch array change, we need to hajack a few array method like `Array.prototype.pop()` and `Array.prototype.shift()`. And instead of using subscrpt syntax to set array value, we'll use `Vue.set` API inplemented in the last secion.

Here is the test case for observing array mutation, when we using `Array` API that will cause mutation, the change will be observed. And each of array's element will be observed, too.

*test/observer/observer.spec.js*

```
describe('Observer test', function() {
	// new
	it('observing array mutation', () => {
    const arr = []
    const ob = observe(arr)
    const dep = ob.dep
    spyOn(dep, 'notify')
    const objs = [{}, {}, {}]
    arr.push(objs[0])
    arr.pop()
    arr.unshift(objs[1])
    arr.shift()
    arr.splice(0, 0, objs[2])
    arr.sort()
    arr.reverse()
    expect(dep.notify.calls.count()).toBe(7)
    // inserted elements should be observed
    objs.forEach(obj => {
      expect(obj.__ob__ instanceof Observer).toBe(true)
    })
  });
  ···
}
```

The first step is handle array in `Observer`:

*src/observer/index.js*

```
export function Observer(value) {
  this.value = value
  this.dep = new Dep()
  //this.walk(value) //deleted
  // new
  if(Array.isArray(value)){
    this.observeArray(value)
  }else{
    this.walk(value)
  }
  def(value, '__ob__', this)
}
```

`observeArray` just iterate over the array and call `observe` on every item.

*src/observer/index.js*

```
···
Observer.prototype.observeArray = function(items) {
  for (let i = 0, l = items.length; i < l; i++) {
    observe(items[i])
  }
}
```

Next we're going to warp the original `Array` method by modifying the prototype chain. 

First, we create a singleton that has all the array mutation method. Those array methods are warpped with other logic that deals with change detection.

*src/observer/array.js*

```
import { def } from '../util/index'

const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

/**
 * Intercept mutating methods and emit events
 */
;[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
.forEach(function (method) {
  // cache original method
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator () {
    let i = arguments.length
    const args = new Array(i)
    while (i--) {
      args[i] = arguments[i]
    }
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
        inserted = args
        break
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    // notify change
    ob.dep.notify()
    return result
  })
})
```

`arrayMethods` is the singleton that has all array mutation method.

For all the methods in array:

```
['push','pop','shift','unshift','splice','sort','reverse']
```

We define a `mutator` function that warps the original method.

In the `mutator` function, we first get the arguments as an array. Next, we apply the original array method  with the arguments array and keep the result.

For the case when adding new items to array, we call `observeArray` on the new array items. 

Finaly, we notify change using `ob.dep.notify()`, and return the result.

Second, we need to add this singleton into the prototype chain.

If we can use `__proto__` in the current browser, we'll directly point the array's prototype to the singleton we created recently. 

If this is not the case, we'll mix `arrayMethods` singleton into the observed array.

So we need a few helper funtion:

*src/observer/index.js*

```
// helpers
/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src) {
  target.__proto__ = src
}

/**
 * Augment an target Object or Array by defining
 * properties.
 */
function copyAugment (target, src, keys) {
  for (let i = 0, l = keys.length; i < l; i++) {
    var key = keys[i]
    def(target, key, src[key])
  }
}
```

In `Observer` function, we use `protoAugment` or `copyAugment` depending on whether we can use `__proto__` or not, to augment the original array:

*src/observer/index.js*

```
import {
  def,
  hasOwn,
  hasProto, //new
  isObject
}
from '../util/index'

export function Observer(value) {
  this.value = value
  this.dep = new Dep()
  if(Array.isArray(value)){
    //new
    var augment = hasProto
        ? protoAugment
        : copyAugment
      augment(value, arrayMethods, arrayKeys)
    this.observeArray(value)
  }else{
    this.walk(value)
  }
  def(value, '__ob__', this)
}
```

The definiion of `hasProto` is trival:

*src/util/index.js*

```
···
export var hasProto = '__proto__' in {}
```

That should be enough to pass the `observing array mutation` test.

//something about dependArray(value)

### Watcher

We had mocked the `Watcher` in previous test like this:

```
const watcher = {
	deps: [],
	addDep (dep) {
		this.deps.push(dep)
		dep.addSub(this)
    },
    update: jasmine.createSpy()
}
```

So watcher here is basically a object which has a `deps` property that records all dependencies of this watcher, and it also has a `addDep` method for adding dependency, and a `update` method that will be called when the data watched has changed.

Let's take a look at the Watcher constructor signature: 

```
constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: Object
  )
```

So the Watcher constructor takes a `expOrFn` paramater, and a callback `cb`. The `expOrFn` is a expression or a function which is evaluated when initializing a watcher. The callback is called when that watcher need to run.

The test below should shed some light on how watcher works.

*test/observer/watcher.spec.js*

```
import Vue from "../../src/instance/index";
import Watcher from "../../src/observer/watcher";

describe('Wathcer test', function() {
  it('should call callback when simple data change', function() {
  	var vm = new Vue({
  		data:{
  			a:2
  		}
  	})
  	var cb = jasmine.createSpy('callback');
  	var watcher = new Watcher(vm, function(){
  		var a = vm.a
  	}, cb)
  	vm.a = 5;
    expect(cb).toHaveBeenCalled();
  });
});
```

The `expOrFn` is evaluated so the vm's data's specific reactive getter is called(In the case, `vm.a`'s getter). The watcher set itself as the current target of dep. So `vm.a`'s dep will push this watcher instance to it's `subs` array. And watcher will push `vm.a`'s dep to it's `deps` array. When `vm.a`'s setter is called, `vm.a`'s dep's `subs` array will be iterated and each watcher in `subs` array's `update` method will be called. Finally the callback of watcher will be called.

Now we can start inplement the Watcher Class:

**src/observer/watcher.js**

```
export default function Watcher(vm, expOrFn, cb, options) {
  options = options ? options : {}
  this.vm = vm
  vm._watchers.push(this)
  this.cb = cb

  // options
  this.deps = []
  this.newDeps = []
  this.depIds = new Set()
  this.newDepIds = new Set()
  if (typeof expOrFn === 'function') {
    this.getter = expOrFn
  }
  this.value = this.get()
}
```

The get method 

**src/observer/watcher.js**

```
Watcher.prototype.get = function() {
  pushTarget(this)
  var value = this.getter.call(this.vm, this.vm)
  popTarget()
  this.cleanupDeps()
  return value
}
```

addDep and cleanupDeps methods

**src/observer/watcher.js**

```
/**
 * Add a dependency to this directive.
 */
Watcher.prototype.addDep = function(dep) {
  var id = dep.id
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id)
    this.newDeps.push(dep)
    if (!this.depIds.has(id)) {
      dep.addSub(this)
    }
  }
}

/**
 * Clean up for dependency collection.
 */
Watcher.prototype.cleanupDeps = function() {
  var i = this.deps.length
  while (i--) {
    var dep = this.deps[i]
    if (!this.newDepIds.has(dep.id)) {
      dep.removeSub(this)
    }
  }
  var tmp = this.depIds
  this.depIds = this.newDepIds
  this.newDepIds = tmp
  this.newDepIds.clear()
  tmp = this.deps
  this.deps = this.newDeps
  this.newDeps = []
}
```

`Watcher.prototype.update` and `Watcher.prototype.run` method 

**src/observer/watcher.js**

```
Watcher.prototype.update = function() {
  console.log("update!!")
  this.run()
}

Watcher.prototype.run = function() {
  var value = this.get()
  var oldValue = this.value
  this.value = value
  this.cb.call(this.vm, value, oldValue)
}
```

### Watch array

Todo

### Async Batch Queue

The unit test part will use Vue contructor. So this part should be moved to later chapters.

Introduction: Why Async Batch Queue?

unit test

**src/observer/scheduler.js**


queue, flushQueue

```
```

next Tick

### Warp up

Todo


