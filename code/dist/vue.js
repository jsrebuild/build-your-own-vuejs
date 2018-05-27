var Vue = (function () {
  'use strict';

  function VNode(tag, data, children, text, elm, context, componentOptions) {
      this.tag = tag;
      this.data = data;
      this.children = children;
      this.text = text;
      this.elm = elm;
      this.ns = undefined;
      this.context = context;
      this.functionalContext = undefined;
      this.key = data && data.key;
      this.componentOptions = componentOptions;
      this.componentInstance = undefined;
      this.parent = undefined;
      this.raw = false;
      this.isStatic = false;
      this.isRootInsert = true;
      this.isComment = false;
      this.isCloned = false;
      this.isOnce = false;
  }

  const createEmptyVNode = () => {
    const node = new VNode();
    node.text = '';
    node.isComment = true;
    return node
  };

  /**
   * Strict object type check. Only returns true
   * for plain JavaScript objects.
   */
  function isPlainObject(obj) {
    return _toString.call(obj) === '[object Object]'
  }

  /**
   * Create a cached version of a pure function.
   */
  function cached(fn) {
    const cache = Object.create(null);
    return (function cachedFn (str) {
      const hit = cache[str];
      return hit || (cache[str] = fn(str))
    })
  }

  /**
   * Camelize a hyphen-delimited string.
   */
  const camelizeRE = /-(\w)/g;
  const camelize = cached((str) => {
    return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')
  });

  /**
   * Hyphenate a camelCase string.
   */
  const hyphenateRE = /\B([A-Z])/g;
  const hyphenate = cached((str) => {
    return str.replace(hyphenateRE, '-$1').toLowerCase()
  });

  /**
   * Capitalize a string.
   */
  const capitalize = cached((str) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  });

  function makeMap (
    str,
    expectsLowerCase
  ) {
    const map = Object.create(null);
    const list = str.split(',');
    for (let i = 0; i < list.length; i++) {
      map[list[i]] = true;
    }
    return expectsLowerCase
      ? val => map[val.toLowerCase()]
      : val => map[val]
  }

  /**
   * Return same value
   */
  const identity = (_) => _;

  const isHTMLTag = makeMap(
    'html,body,base,head,link,meta,style,title,' +
    'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
    'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
    'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
    's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
    'embed,object,param,source,canvas,script,noscript,del,ins,' +
    'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
    'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
    'output,progress,select,textarea,' +
    'details,dialog,menu,menuitem,summary,' +
    'content,element,shadow,template,blockquote,iframe,tfoot'
  );

  // this map is intentionally selective, only covering SVG elements that may
  // contain child elements.
  const isSVG = makeMap(
    'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
    'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
    'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
    true
  );


  var config = ({
    /**
     * Check if a tag is reserved so that it cannot be registered as a
     * component. This is platform-dependent and may be overwritten.
     */
    isReservedTag: (tag) => {
      return isHTMLTag(tag) || isSVG(tag)
    },

    /**
     * Parse the real tag name for the specific platform.
     */
    parsePlatformTagName: identity,
  })

  function isReserved (str) {
    var c = (str + '').charCodeAt(0);
    return c === 0x24 || c === 0x5F
  }

  function noop () {}

  /**
   * Resolve an asset.
   * This function is used because child instances need access
   * to assets defined in its ancestor chain.
   */
  function resolveAsset (
    options,
    type,
    id,
    warnMissing
  ) {
    if (typeof id !== 'string') {
      return
    }
    const assets = options[type];
    // check local registration variations first
    if (hasOwn(assets, id)) return assets[id]
    const camelizedId = camelize(id);
    if (hasOwn(assets, camelizedId)) return assets[camelizedId]
    const PascalCaseId = capitalize(camelizedId);
    if (hasOwn(assets, PascalCaseId)) return assets[PascalCaseId]
    // fallback to prototype chain
    const res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
    return res
  }

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

  // can we use __proto__?
  var hasProto = '__proto__' in {};

  function isUndef (v){
    return v === undefined || v === null
  }

  function isDef (v){
    return v !== undefined && v !== null
  }



  var strats = Object.create(null);
  /**
   * Default strategy.
   */
  var defaultStrat = function (parentVal, childVal) {
    return childVal === undefined
      ? parentVal
      : childVal
  };

  // strats.data = function (
  //   parentVal,
  //   childVal,
  //   vm
  // ) {
  //   if (!vm) {
  //     if (childVal && typeof childVal !== 'function') {
  //       return parentVal
  //     }
  //     return mergeDataOrFn(parentVal, childVal)
  //   }

  //   return mergeDataOrFn(parentVal, childVal, vm)
  // }

  /**
   * Ensure all props option syntax are normalized into the
   * Object-based format.
   */
  function normalizeProps (options, vm) {
    const props = options.props;
    if (!props) return
    const res = {};
    let i, val, name;
    if (Array.isArray(props)) {
      i = props.length;
      while (i--) {
        val = props[i];
        if (typeof val === 'string') {
          name = camelize(val);
          res[name] = { type: null };
        } 
      }
    } else if (isPlainObject(props)) {
      for (const key in props) {
        val = props[key];
        name = camelize(key);
        res[name] = isPlainObject(val)
          ? val
          : { type: val };
      }
    } 
    options.props = res;
  }

  /**
   * Merge two option objects into a new one.
   * Core utility used in both instantiation and inheritance.
   */
  function mergeOptions (
    parent,
    child,
    vm
  ){
    if (typeof child === 'function') {
      child = child.options;
    }
    normalizeProps(child, vm);
    
    // normalizeInject(child, vm)
    // normalizeDirectives(child)
    const extendsFrom = child.extends;
    if (extendsFrom) {
      parent = mergeOptions(parent, extendsFrom, vm);
    }
    if (child.mixins) {
      for (let i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm);
      }
    }
    const options = {};
    let key;
    for (key in parent) {
      mergeField(key);
    }
    for (key in child) {
      if (!hasOwn(parent, key)) {
        mergeField(key);
      }
    }
    function mergeField (key) {
      
      const strat = strats[key] || defaultStrat;
      options[key] = strat(parent[key], child[key], vm, key);
    }
    return options
  }

  /* @flow */

  function extractPropsFromVNodeData(
    data,
    Ctor,
    tag
  ) {
    // we are only extracting raw values here.
    // validation and default values are handled in the child
    // component itself.
    const propOptions = Ctor.options.props;
    if (isUndef(propOptions)) {
      return
    }
    const res = {};
    const { attrs, props } = data;
    if (isDef(attrs) || isDef(props)) {
      for (const key in propOptions) {
        const altKey = hyphenate(key);
        checkProp(res, props, key, altKey, true) ||
         checkProp(res, attrs, key, altKey, false);
      }
    }
    return res
  }

  function checkProp(
    res,
    hash,
    key,
    altKey,
    preserve
  ) {
    if (isDef(hash)) {
      if (hasOwn(hash, key)) {
        res[key] = hash[key];
        if (!preserve) {
          delete hash[key];
        }
        return true
      } else if (hasOwn(hash, altKey)) {
        res[key] = hash[altKey];
        if (!preserve) {
          delete hash[altKey];
        }
        return true
      }
    }
    return false
  }

  // create的时候主要是返回VNode，真正的创建在render的时候。
  // 这个文件主要包括一个createComponent函数（返回VNode），和一组Component占位VNode专用的VNode钩子。
  // 在patch的时候，比如init的时候，这个钩子就会调用createComponentInstanceForVnode初始化节点

  function createComponent ( Ctor, data, context, children, tag){
    if (isUndef(Ctor)) {
      return
    }

    const baseCtor = context.$options._base;

    // plain options object: turn it into a constructor
    if (isObject(Ctor)) {
      Ctor = baseCtor.extend(Ctor);
    }

    // resolve constructor options in case global mixins are applied after
    // component constructor creation
    // resolveConstructorOptions(Ctor)

    data = data || {};

    // // transform component v-model data into props & events
    // if (isDef(data.model)) {
    //   transformModel(Ctor.options, data)
    // }

    // extract props
    const propsData = extractPropsFromVNodeData(data, Ctor, tag);

    // // functional component
    // if (isTrue(Ctor.options.functional)) {
    //   return createFunctionalComponent(Ctor, propsData, data, context, children)
    // }

    // extract listeners, since these needs to be treated as
    // child component listeners instead of DOM listeners
    const listeners = data.on;
    // replace with listeners with .native modifier
    data.on = data.nativeOn;

    // if (isTrue(Ctor.options.abstract)) {
    //   // abstract components do not keep anything
    //   // other than props & listeners
    //   data = {}
    // }

    // merge component management hooks onto the placeholder node
    // mergeHooks(data)

    // return a placeholder vnode
    const name = Ctor.options.name || tag;
    const vnode = new VNode(
      `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
      data, undefined, undefined, undefined, context,
      { Ctor, propsData, listeners, tag, children }
    );
    return vnode
  }

  /**
   * normalization这一步应该是在Compile的时候就已经做了，这里我们先不加相关的处理
   */


  function createElement(
    context,
    tag,
    data,
    children
  ) {
    return _createElement(context, tag, data, children);
  }

  function _createElement(
    context,
    tag,
    data,
    children
  ) {
    // if (normalizationType === ALWAYS_NORMALIZE) {
    //   children = normalizeChildren(children)
    // } else if (normalizationType === SIMPLE_NORMALIZE) {
    //   children = simpleNormalizeChildren(children)
    // }
    let vnode;
    if (typeof tag === "string") {
      let Ctor;
      if (config.isReservedTag(tag)) {
        // platform built-in elements
        vnode = new VNode(
          config.parsePlatformTagName(tag),
          data,
          children,
          undefined,
          undefined,
          context
        );
      } else if (
        isDef((Ctor = resolveAsset(context.$options, "components", tag)))
      ) {
        // component
        vnode = createComponent(Ctor, data, context, children, tag);
      } else {
        // unknown or unlisted namespaced elements
        // check at runtime because it may get assigned a namespace when its
        // parent normalizes children
        vnode = new VNode(tag, data, children, undefined, undefined, context);
      }
    } else {
      // direct component options / constructor
      vnode = createComponent(tag, data, context, children);
    }
    if (!isDef(vnode)) {
      return createEmptyVNode();
    }
    return vnode;
  }

  function initRender (vm) {
  	vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false);
    vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true);
  }

  function renderMixin (Vue) {
    Vue.prototype.$nextTick = function (fn) {

    };
    Vue.prototype._render = function () {

    };
  }

  var  uid = 0;

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

  let uid$1 = 0;

  function Watcher(vm, expOrFn, cb, options) {
    options = options ? options : {};
    this.vm = vm;
    vm._watchers.push(this);
    this.cb = cb;
    this.id = ++uid$1;
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
    this.newDeps = [];
  };

  /*
   * not type checking this file because flow doesn't play well with
   * dynamically accessing methods on Array prototype
   */

  const arrayProto = Array.prototype;
  const arrayMethods = Object.create(arrayProto)

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
    const original = arrayProto[method];
    def(arrayMethods, method, function mutator () {
      // avoid leaking arguments:
      // http://jsperf.com/closure-with-arguments
      let i = arguments.length;
      const args = new Array(i);
      while (i--) {
        args[i] = arguments[i];
      }
      const result = original.apply(this, args);
      const ob = this.__ob__;
      let inserted;
      switch (method) {
        case 'push':
          inserted = args;
          break
        case 'unshift':
          inserted = args;
          break
        case 'splice':
          inserted = args.slice(2);
          break
      }
      if (inserted) ob.observeArray(inserted);
      // notify change
      ob.dep.notify();
      return result
    });
  });

  var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

  function Observer(value) {
    this.value = value;
    this.dep = new Dep();
    //this.walk(value)
    if(Array.isArray(value)){
      var augment = hasProto
          ? protoAugment
          : copyAugment;
        augment(value, arrayMethods, arrayKeys);
      this.observeArray(value);
    }else{
      this.walk(value);
    }
    def(value, '__ob__', this);
  }

  Observer.prototype.walk = function(obj) {
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]]);
    }
  };

  Observer.prototype.observeArray = function(items) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i]);
    }
  };

  function observe(value) {
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

  function defineReactive(obj, key, val) {
    var dep = new Dep();
    var childOb = observe(val);
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get: function reactiveGetter() {
        var value = val;
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
      set: function reactiveSetter(newVal) {
        var value = val;
        if (newVal === value || (newVal !== newVal && value !== value)) {
          return
        }
        val = newVal;
        childOb = observe(newVal);
        dep.notify();
      }
    });
  }

  // helpers

  /**
   * Augment an target Object or Array by intercepting
   * the prototype chain using __proto__
   */
  function protoAugment (target, src) {
    /* eslint-disable no-proto */
    target.__proto__ = src;
    /* eslint-enable no-proto */
  }

  /**
   * Augment an target Object or Array by defining
   * hidden properties.
   *
   * istanbul ignore next
   */
  function copyAugment (target, src, keys) {
    for (let i = 0, l = keys.length; i < l; i++) {
      var key = keys[i];
      def(target, key, src[key]);
    }
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
    data = vm._data = typeof data === 'function'
      ? getData(data, vm)
      : data || {};
    // proxy data on instance
    var keys = Object.keys(data);

    var i = keys.length;
    while (i--) {
      proxy(vm, keys[i]);
    }

    // observe data
    observe(data);
  }

  function getData(data, vm) {
    return data.call(vm, vm)
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
  	Vue.prototype._update = function (vnode) {

  	};
    Vue.prototype.$mount = function(el) {

    	var vm = this;
      vm._watcher = new Watcher(vm, function(){
        console.log(vm.a, "update!!!");
      }, noop);
      return vm
    };
    Vue.prototype.$destroy = function() {

    };
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      // vm.$options = options;
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      );

      // should be in global api
      vm.$options._base = Vue;

      initLifecycle(vm);
      initState(vm);
      initRender(vm);

      vm.$mount(options);
    };
  }

  function resolveConstructorOptions(Ctor) {
    let options = Ctor.options;
    // if (Ctor.super) {
    //   const superOptions = resolveConstructorOptions(Ctor.super)
    //   const cachedSuperOptions = Ctor.superOptions
    //   if (superOptions !== cachedSuperOptions) {
    //     // super option changed,
    //     // need to resolve new options.
    //     Ctor.superOptions = superOptions
    //     // check if there are any late-modified/attached options (#4976)
    //     const modifiedOptions = resolveModifiedOptions(Ctor)
    //     // update base extend options
    //     if (modifiedOptions) {
    //       extend(Ctor.extendOptions, modifiedOptions)
    //     }
    //     options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
    //     if (options.name) {
    //       options.components[options.name] = Ctor
    //     }
    //   }
    // }
    return options
  }

  function Vue (options) {
    this._init(options);
  }

  initMixin(Vue);
  lifecycleMixin(Vue);
  renderMixin(Vue);

  return Vue;

}());
