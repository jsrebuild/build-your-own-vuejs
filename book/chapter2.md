## Chapter2: Reactivity system


Vue's reactivity system makes data binding between model and view  simple and intuitive. Data is defined as plain JavaScript object. When data changes, the view updated to reflex the lastest state. It works like a charm.

Under the hood, Vue will walk through all of the data's properties and convert them to getter/setters using `Object.defineProperty`. 

Each primitive key-value pair in data has an Observer instance. The observer will send a signal for watchers watching value change.

And each Vue instance has a Watcher instance which records any properties “touched” during the component’s render as dependencies. Watcher will re-collect  dependencies and run the callback passed earlier.

So how do observer notify watcher for data change? Observer pattern to the rescue! We define a new class called Dep, which means "Dependence", to serve as a mediator. Observer instance has a reference for all the deps it needs to notify when data changes. And each dep instance nows which watcher it needs to update. 

That's basically how the reactivity system works from a 100,000 feet view. In the next few sections, we'll have a closer look at the implementation details of the reactivity system.




### Dep

The implemetation of deps is stratforwd. Each dep instance has a uid to distinguish them. The `subs` array records all watchers subscribe to this dep instance. `Dep.prototype.notify` call each subscribers' update method in `subs` array. `Dep.prototype.depend` is used for dependency collecttion during watcher's re-evaluation. We'll come to watcher later. For now you should only konw that `Dep.target` is the watcher instance be re-evaluated. Since this prop is a static prop, so globally, `Dep.target` points to one watcher at a time.

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
Before we implement Observer, we'll write test first.

*test/observer/observer.spec.js*

```
import {
  Observer,
  observe
} from "../../src/observer/index"
import Dep from '../../src/observer/dep'

describe('Observer test', function() {
  it('observing object prop change', function() {
  	const obj = { a: { b: 2 }, c: NaN}
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
    // collect dep
    Dep.target = watcher
    obj.a.b
    Dep.target = null
    // there should be 
    expect(watcher.deps.length).toBe(3) // obj.a + a + a.b
    obj.a.b = 3
    expect(watcher.update.calls.count()).toBe(1)
  });

});
```

First, we define a plain JavaScript object `obj` as data. Then we use `observe` function to make data reactive. Since we haven't implement watcher yet, we need to mock a watcher. A watcher has a `deps` array for dependency bookkeeping. And `addDep` method works as its name claims. The `update` method will be called when data changes. Here we use a jasmine's spy function as a placeholder. A spy function has no real functionality。 It keeps information like how many times it's been called and the parameters being passed in when called.

Then we set the global `Dep.target` to `watcher`, and get `obj.a.b`. If the data is reactive, then the watcher's update method will be called.

So let's foucus on the observe fucntion first. It checks if the value is an object. If so, it then checks if this value already has a Observer instance attched by checking its `__ob__` property.

If there is no exsiting Observer instance, it will initiate a new `Observer` instance with the value and return it.

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

Now it's time to look at the `Observer` constructor. It will init a `Dep` instance, and it calls `walk` with the value.

*src/observer/index.js*

```
export function Observer(value) {
  this.value = value
  this.dep = new Dep()
  this.walk(value)
  //def(value, '__ob__', this)
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
`Dep.prototype.notify` calls each watcher's `update` medths in the `subs` array. Well, yes, the watchers're the same watchers that were pushed into the `subs` array during `Dep.target.addDep(dep)`. So things're all connected. 

Let's try `npm run test`. The test case we wrote earilier should all pass.

### Observe set/delete 

Todo

### Observe array 

Todo

### Watcher

### Watch array

Todo

### Warp up

Todo


