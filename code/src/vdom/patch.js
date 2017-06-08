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

    }
    return function patch(oldVnode, vnode, parentElm, refElm) {

    }
}
