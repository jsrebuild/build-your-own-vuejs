import Vue from "../../src/instance/index"
import {
  Observer,
  observe
} from "../../src/observer/index"
import Dep from '../../src/observer/dep'

describe('Observer test', function() {
  it('observing object prop change', function() {
  	const obj = { a:1, b:{ a: 1 }, c: NaN}
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
    
    // observing non-primitive value
    Dep.target = watcher
    obj.b.a
    Dep.target = null
    expect(watcher.deps.length).toBe(3) // // obj.b + b + b.a
    obj.b.a = 3
    expect(watcher.update.calls.count()).toBe(1)
    watcher.deps = []

    // // swap object, the object should be observed when set
    // obj.a = { b: 4 }
    // expect(watcher.update.calls.count()).toBe(2)
    
    watcher.deps = []
    Dep.target = watcher
    obj.a.b
    Dep.target = null
    expect(watcher.deps.length).toBe(3)
    // set on the swapped object
    obj.a.b = 5
    expect(watcher.update.calls.count()).toBe(3)
    // should not trigger on NaN -> NaN set
    obj.c = NaN
    expect(watcher.update.calls.count()).toBe(3)
  });

});