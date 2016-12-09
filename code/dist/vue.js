(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Vue = factory());
}(this, (function () { 'use strict';

function initMixin (Vue) {
  Vue.prototype._init = function (options) {
  	console.log("init vue!!");
  };
}

function Vue (options) {
  this._init(options);
}

initMixin(Vue);

return Vue;

})));
