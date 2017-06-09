var hooks = ['create', 'activate', 'update', 'remove', 'destroy']

export function createPatchFunction(backend) {
    var i
    var cbs = {}

    var nodeOps = backend.nodeOps

    // init cbs hooks hash
    for (i = 0; i < hooks.length; ++i) {
        cbs[hooks[i]] = []
    }

    function createElm(vnode, insertedVnodeQueue, parentElm, refElm, nested) {
        var data = vnode.data
        var children = vnode.children
        var tag = vnode.tag
        if (isDef(tag)) {
            vnode.elm = nodeOps.createElement(tag, vnode)
            createChildren(vnode, children, insertedVnodeQueue)
            if (isDef(data)) {
                invokeCreateHooks(vnode, insertedVnodeQueue)
            }
            insert(parentElm, vnode.elm, refElm)
        }
    }

    // patch only apply for the current component, Vue did not call patch recursively
    function createComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
        let i = vnode.data
        if (isDef(i)) {
            if (isDef(i = i.hook) && isDef(i = i.init)) {
                i(vnode, parentElm, refElm)
            }
            // after calling the init hook, if the vnode is a child component
            // it should've created a child instance and mounted it. the child
            // component also has set the placeholder vnode's elm.
            // in that case we can just return the element and be done.
            if (isDef(vnode.componentInstance)) {
                initComponent(vnode, insertedVnodeQueue)
                return true
            }
        }
    }

    function initComponent(vnode, insertedVnodeQueue) {
        // if (isDef(vnode.data.pendingInsert)) {
        //     insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert)
        // }
        vnode.elm = vnode.componentInstance.$el
            // if (isPatchable(vnode)) {
            //     invokeCreateHooks(vnode, insertedVnodeQueue)
            //     setScope(vnode)
            // } else {
            //     // empty component root.
            //     // skip all element-related modules except for ref (#3455)
            //     registerRef(vnode)
            //         // make sure to invoke the insert hook
            //     insertedVnodeQueue.push(vnode)
            // }
    }

    function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {

    }

    function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
        if (oldVnode === vnode) {
            return
        }
        // reuse element for static trees.
        // note we only do this if the vnode is cloned -
        // if the new node is not cloned it means the render functions have been
        // reset by the hot-reload-api and we need to do a proper re-render.
        if (isTrue(vnode.isStatic) &&
            isTrue(oldVnode.isStatic) &&
            vnode.key === oldVnode.key &&
            (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
        ) {
            vnode.elm = oldVnode.elm
            vnode.componentInstance = oldVnode.componentInstance
            return
        }
        let i
        const data = vnode.data
        if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
            i(oldVnode, vnode)
        }
        const elm = vnode.elm = oldVnode.elm
        const oldCh = oldVnode.children
        const ch = vnode.children
        if (isDef(data) && isPatchable(vnode)) {
            for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
            if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
        }
        if (isUndef(vnode.text)) {
            if (isDef(oldCh) && isDef(ch)) {
                if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
            } else if (isDef(ch)) {
                if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
                addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
            } else if (isDef(oldCh)) {
                removeVnodes(elm, oldCh, 0, oldCh.length - 1)
            } else if (isDef(oldVnode.text)) {
                nodeOps.setTextContent(elm, '')
            }
        } else if (oldVnode.text !== vnode.text) {
            nodeOps.setTextContent(elm, vnode.text)
        }
        if (isDef(data)) {
            if (isDef(i = data.hook) && isDef(i = i.postpatch)) i(oldVnode, vnode)
        }
    }

    function invokeInsertHook(vnode, queue) {
        // delay insert hooks for component root nodes, invoke them after the
        // element is really inserted
        // if (isTrue(initial) && isDef(vnode.parent)) {
        //     vnode.parent.data.pendingInsert = queue
        // } else {

        // }
        for (let i = 0; i < queue.length; ++i) {
            queue[i].data.hook.insert(queue[i])
        }
    }

    return function patch(oldVnode, vnode, parentElm, refElm) {
        if (isUndef(vnode)) {
            if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
            return
        }

        const insertedVnodeQueue = []

        if (isUndef(oldVnode)) {
            // empty mount (likely as component), create new root element
            createElm(vnode, insertedVnodeQueue, parentElm, refElm)
        } else {
            const isRealElement = isDef(oldVnode.nodeType)
            if (!isRealElement && sameVnode(oldVnode, vnode)) {
                // patch existing root node
                patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly)
            } else {
                if (isRealElement) {
                    // mounting to a real element
                    // check if this is server-rendered content and if we can perform
                    // a successful hydration.
                    if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
                        oldVnode.removeAttribute(SSR_ATTR)
                        hydrating = true
                    }
                    if (isTrue(hydrating)) {
                        if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                            invokeInsertHook(vnode, insertedVnodeQueue, true)
                            return oldVnode
                        } else if (process.env.NODE_ENV !== 'production') {
                            warn(
                                'The client-side rendered virtual DOM tree is not matching ' +
                                'server-rendered content. This is likely caused by incorrect ' +
                                'HTML markup, for example nesting block-level elements inside ' +
                                '<p>, or missing <tbody>. Bailing hydration and performing ' +
                                'full client-side render.'
                            )
                        }
                    }
                    // either not server-rendered, or hydration failed.
                    // create an empty node and replace it
                    oldVnode = emptyNodeAt(oldVnode)
                }
                // replacing existing element
                const oldElm = oldVnode.elm
                const parentElm = nodeOps.parentNode(oldElm)
                createElm(
                    vnode,
                    insertedVnodeQueue,
                    // extremely rare edge case: do not insert if old element is in a
                    // leaving transition. Only happens when combining transition +
                    // keep-alive + HOCs. (#4590)
                    oldElm._leaveCb ? null : parentElm,
                    nodeOps.nextSibling(oldElm)
                )

                if (isDef(vnode.parent)) {
                    // component root element replaced.
                    // update parent placeholder node element, recursively
                    let ancestor = vnode.parent
                    while (ancestor) {
                        ancestor.elm = vnode.elm
                        ancestor = ancestor.parent
                    }
                    if (isPatchable(vnode)) {
                        for (let i = 0; i < cbs.create.length; ++i) {
                            cbs.create[i](emptyNode, vnode.parent)
                        }
                    }
                }

                if (isDef(parentElm)) {
                    removeVnodes(parentElm, [oldVnode], 0, 0)
                } else if (isDef(oldVnode.tag)) {
                    invokeDestroyHook(oldVnode)
                }
            }
        }

        invokeInsertHook(vnode, insertedVnodeQueue)
        return vnode.elm
    }
}
