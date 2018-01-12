import {
  isDef,
  isUndef
} from 'core/util/index'

import {
  isBooleanAttr,
  isEnumeratedAttr,
  isFalsyAttrValue
} from '../util'

function updateAttrs (oldVnode, vnode) {
  const opts = vnode.componentOptions
  // if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
  //   return
  // }
  // if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
  //   return
  // }
  let key, cur, old
  const elm = vnode.elm
  const oldAttrs = oldVnode.data.attrs || {}
  let attrs = vnode.data.attrs || {}
  // // clone observed objects, as the user probably wants to mutate it
  // if (isDef(attrs.__ob__)) {
  //   attrs = vnode.data.attrs = extend({}, attrs)
  // }

  for (key in attrs) {
    cur = attrs[key]
    old = oldAttrs[key]
    if (old !== cur) {
      setAttr(elm, key, cur)
    }
  }

  for (key in oldAttrs) {
    if (isUndef(attrs[key])) {
      elm.removeAttribute(key)
    }
  }
}

function setAttr (el, key, value) {
  if (isBooleanAttr(key)) {
    // set attribute for blank value
    // e.g. <option disabled>Select one</option>
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key)
    } else {
      // technically allowfullscreen is a boolean attribute for <iframe>,
      // but Flash expects a value of "true" when used on <embed> tag
      value = key === 'allowfullscreen' && el.tagName === 'EMBED'
        ? 'true'
        : key
      el.setAttribute(key, value)
    }
  } else if (isEnumeratedAttr(key)) {
    el.setAttribute(key, isFalsyAttrValue(value) || value === 'false' ? 'false' : 'true')
  } else {
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, value)
    }
  }
}

export default {
  create: updateAttrs,
  update: updateAttrs
}
