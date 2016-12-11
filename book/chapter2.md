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

Before we can 

*test/observer/observer.spec.js*


### Observe set/delete 

### Observe array 

### Watcher

### Watch array

### Warp up



