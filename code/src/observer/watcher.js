import Dep, {
  pushTarget, popTarget
}
from './dep'

let uid = 0

export default function Watcher(vm, expOrFn, cb, options) {
  options = options ? options : {}
  this.vm = vm
  vm._watchers.push(this)
  this.cb = cb
  this.id = ++uid
  // options
  this.deep = !!options.deep
  this.user = !!options.user
  this.lazy = !!options.lazy
  this.sync = !!options.sync
  this.deps = []
  this.newDeps = []
  this.depIds = new Set()
  this.newDepIds = new Set()
  if (typeof expOrFn === 'function') {
    this.getter = expOrFn
  }
  this.value = this.lazy ? undefined : this.get()
}

Watcher.prototype.get = function() {
  pushTarget(this)
  var value = this.getter.call(this.vm, this.vm)
    // "touch" every property so they are all tracked as
    // dependencies for deep watching
    // if (this.deep) {
    //   traverse(value)
    // }
  popTarget()
  this.cleanupDeps()
  return value
}

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
