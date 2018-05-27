export default function VNode(tag, data, children, text, elm, context, componentOptions) {
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text
    this.elm = elm
    this.ns = undefined
    this.context = context
    this.key = data && data.key
    this.componentOptions = componentOptions
    this.componentInstance = undefined
    this.parent = undefined
    this.isStatic = false
    this.isComment = false
    // this.isCloned = false
    // this.isOnce = false
}

export const createEmptyVNode = () => {
  const node = new VNode()
  node.text = ''
  node.isComment = true
  return node
}

export function createTextVNode (val) {
  return new VNode(undefined, undefined, undefined, String(val))
}