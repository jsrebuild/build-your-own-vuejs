import { makeMap } from "core/shared/util";

import { isDef, isObject } from "core/util/index";

// // these are reserved for web because they are directly compiled away
// // during template compilation
// export const isReservedAttr = makeMap('style,class')

// // attributes that should be using props for binding
// const acceptValue = makeMap('input,textarea,option,select,progress')
// export const mustUseProp = (tag: string, type: ?string, attr: string): boolean => {
//   return (
//     (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
//     (attr === 'selected' && tag === 'option') ||
//     (attr === 'checked' && tag === 'input') ||
//     (attr === 'muted' && tag === 'video')
//   )
// }

export const isEnumeratedAttr = makeMap("contenteditable,draggable,spellcheck");

export const isBooleanAttr = makeMap(
  "allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare," +
    "default,defaultchecked,defaultmuted,defaultselected,defer,disabled," +
    "enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple," +
    "muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly," +
    "required,reversed,scoped,seamless,selected,sortable,translate," +
    "truespeed,typemustmatch,visible"
);

// export const xlinkNS = 'http://www.w3.org/1999/xlink'

// export const isXlink = (name: string): boolean => {
//   return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
// }

// export const getXlinkProp = (name: string): string => {
//   return isXlink(name) ? name.slice(6, name.length) : ''
// }

export const isFalsyAttrValue = val => {
  return val == null || val === false;
};

export function stringifyClass(value) {
  if (Array.isArray(value)) {
    return stringifyArray(value);
  }
  if (isObject(value)) {
    return stringifyObject(value);
  }
  if (typeof value === "string") {
    return value;
  }
  return "";
}

export function concat(a, b) {
  return a ? (b ? a + " " + b : a) : b || "";
}

export function renderClass(staticClass, dynamicClass) {
  if (isDef(staticClass) || isDef(dynamicClass)) {
    return concat(staticClass, stringifyClass(dynamicClass));
  }
  /* istanbul ignore next */
  return "";
}

export function genClassForVnode(vnode) {
  let data = vnode.data;
  let parentNode = vnode;
  let childNode = vnode;
  while (isDef(childNode.componentInstance)) {
    childNode = childNode.componentInstance._vnode;
    if (childNode && childNode.data) {
      data = mergeClassData(childNode.data, data);
    }
  }
  while (isDef((parentNode = parentNode.parent))) {
    if (parentNode && parentNode.data) {
      data = mergeClassData(data, parentNode.data);
    }
  }
  return renderClass(data.staticClass, data.class);
}
