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

Now it's time to look at the `Observer` constructor. It will init a `Dep` instance, and it calls `walk` with the value. And it attachs observer to `value` as `__ob__ ` property.

*src/observer/index.js*

```
export function Observer(value) {
  this.value = value
  this.dep = new Dep()
  this.walk(value)
  value.__ob__ = this
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
  hasOwn
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

Besides, we need a little utility function `hasOwn`, which is a simple warpper for `Object.prototype.hasOwnProperty`:


*src/util/index.js*

```
var hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}
```

### Observing array 

test case

```
```

this.observeArray(value)

dependArray(value)

### Watcher

### Watch array

Todo

### Warp up

Todo


