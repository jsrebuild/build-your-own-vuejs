import Vue from "../../src/index"
import {
  Observer,
  observe,
  set as setProp,
  del as delProp
}
from "../../src/observer/index"
import {
  hasOwn
}
from '../../src/util/index'
import Dep from '../../src/observer/dep'

describe('Observer test', function() {

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

  it('observing set/delete', function() {
    const obj1 = {
      a: 1
    }
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
    expect(dep1.notify.calls.count()).toBe(2)
  });

  it('observing object prop change', function() {
    const obj = {
      a: 1,
      b: {
        a: 1
      },
      c: NaN
    }
    observe(obj)
      // mock a watcher!
    const watcher = {
        deps: [],
        addDep(dep) {
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
    expect(watcher.update.calls.count()).toBe(2)
    watcher.deps = []

    // swap object, the object should be observed when set
    obj.a = { b: 4 }
    expect(watcher.update.calls.count()).toBe(3)

    watcher.deps = []
    Dep.target = watcher
    obj.a.b
    Dep.target = null
    expect(watcher.deps.length).toBe(3)
    // set on the swapped object
    obj.a.b = 5
    expect(watcher.update.calls.count()).toBe(4)
    //should not trigger on NaN -> NaN set
    obj.c = NaN
    expect(watcher.update.calls.count()).toBe(4)
  });

});
