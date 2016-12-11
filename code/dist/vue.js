var Vue = (function () {
'use strict';

function initRender (vm) {
  vm._mount(vm.$options.el);
}

function renderMixin (Vue) {
  Vue.prototype.$nextTick = function (fn) {

  };
  Vue.prototype._render = function () {

  };
}

var uid = 0;

function Dep(argument) {
  this.id = uid++;
  this.subs = [];
}

Dep.prototype.addSub = function(sub) {
  this.subs.push(sub);
};

Dep.prototype.removeSub = function(sub) {
  remove(this.subs, sub);
};

Dep.prototype.depend = function() {
  if (Dep.target) {
    Dep.target.addDep(this);
  }
};

Dep.prototype.notify = function() {
  var subs = this.subs.slice();
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update();
  }
};

Dep.target = null;
var targetStack = [];

function pushTarget (_target) {
  if (Dep.target) targetStack.push(Dep.target);
  Dep.target = _target;
}

function popTarget () {
  Dep.target = targetStack.pop();
}

function Watcher(vm, expOrFn, cb, options) {
  options = options ? options : {};
  this.vm = vm;
  vm._watchers.push(this);
  this.cb = cb;

  // options
  this.deep = !!options.deep;
  this.user = !!options.user;
  this.lazy = !!options.lazy;
  this.sync = !!options.sync;
  this.deps = [];
  this.newDeps = [];
  this.depIds = new Set();
  this.newDepIds = new Set();
  if (typeof expOrFn === 'function') {
    this.getter = expOrFn;
  }
  this.value = this.lazy ? undefined : this.get();
}

Watcher.prototype.get = function() {
  pushTarget(this);
  var value = this.getter.call(this.vm, this.vm);
    // "touch" every property so they are all tracked as
    // dependencies for deep watching
    // if (this.deep) {
    //   traverse(value)
    // }
  popTarget();
  this.cleanupDeps();
  return value
};

/**
 * Add a dependency to this directive.
 */
Watcher.prototype.addDep = function(dep) {
  var id = dep.id;
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id);
    this.newDeps.push(dep);
    if (!this.depIds.has(id)) {
      dep.addSub(this);
    }
  }
};

Watcher.prototype.update = function() {
  this.run();
};

Watcher.prototype.run = function() {
  var value = this.get();
  var oldValue = this.value;
  this.value = value;
  this.cb.call(this.vm, value, oldValue);
};

/**
 * Clean up for dependency collection.
 */
Watcher.prototype.cleanupDeps = function() {
  var i = this.deps.length;
  while (i--) {
    var dep = this.deps[i];
    if (!this.newDepIds.has(dep.id)) {
      dep.removeSub(this);
    }
  }
  var tmp = this.depIds;
  this.depIds = this.newDepIds;
  this.newDepIds = tmp;
  this.newDepIds.clear();
  tmp = this.deps;
  this.deps = this.newDeps;
  this.newDeps = tmp;
  this.newDeps.length = 0;
};

function isReserved (str) {
  var c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F
}

function noop () {}

function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

var hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}
function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

function Observer(value) {
  this.value = value;
  this.dep = new Dep();
	this.walk(value);
	def(value, '__ob__', this);
}

Observer.prototype.walk = function(obj) {
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    if (typeof obj[keys[i]] == "object") {
      this.walk(obj[keys[i]]);
    }else {
      defineReactive(obj, keys[i], obj[keys[i]]);
    }
  }
};

function observe (value){
  console.log(value);
  if (!isObject(value)) {
    return
  }
  var ob;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else {
    ob = new Observer(value);
  }
  return ob
}

function defineReactive (obj, key, val) {
  var dep = new Dep();
  var childOb = observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      var value = val;
      console.log("ff");
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
        }
        // if (Array.isArray(value)) {
        //   dependArray(value)
        // }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      var value =  val;
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
			val = newVal;
      childOb = observe(newVal);
      dep.notify();
    }
  });
}

function initState(vm) {
  vm._watchers = [];
    //initProps(vm)
    //initMethods(vm)
  initData(vm);
    //initComputed(vm)
    //initWatch(vm)
}

function initData(vm) {
  var data = vm.$options.data;
  vm._data = data;
  // proxy data on instance
  var keys = Object.keys(data);

  var i = keys.length;
  while (i--) {
    proxy(vm, keys[i]);
  }

  // observe data
  observe(data);
}



function proxy(vm, key) {
  if (!isReserved(key)) {
    Object.defineProperty(vm, key, {
      configurable: true,
      enumerable: true,
      get: function proxyGetter() {
        return vm._data[key]
      },
      set: function proxySetter(val) {
        vm._data[key] = val;
      }
    });
  }
}

function initLifecycle(vm) {
  vm._watcher = null;
}

function lifecycleMixin(Vue) {
  Vue.prototype._mount = function(el) {
  	var vm = this;
    vm._watcher = new Watcher(vm, function(){
      console.log(vm.a.b, "update!!!");
    }, noop);
  };
  Vue.prototype.$destroy = function() {

  };
}

function initMixin (Vue) {
  Vue.prototype._init = function (options) {
  	var vm = this;
  	vm.$options = options;
  	initLifecycle(vm);
  	initState(vm);
  	initRender(vm);
  };
}

function Vue (options) {
  this._init(options);
}

initMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);

return Vue;

}());
