/**
 * normalization这一步应该是在Compile的时候就已经做了，这里我们先不加相关的处理
 */
import VNode, { createEmptyVNode } from "./vnode";
import config from "../config";
import { createComponent } from "./create-component";

import {
  isDef,
  isUndef,
  isTrue,
  isPrimitive,
  resolveAsset
} from "../util/index";


export function createElement(
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
  let vnode, ns;
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
