import Vue from "../../src/instance/index"
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
    expect(watcher.deps.length).toBe(3) // obj.a + a + a.b
    obj.a.b = 3
    expect(watcher.update.calls.count()).toBe(1)
    // swap object, the object should be observed when set
    obj.a = { b: 4 }
    expect(watcher.update.calls.count()).toBe(2)
    
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