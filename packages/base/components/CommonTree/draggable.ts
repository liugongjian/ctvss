import { DirectiveOptions } from 'vue'

const drag: any = {
  node: null,
  cloneElm: null
}

/* 开始拖拽 */
function onDragStart(e) {
  e.dataTransfer.setDragImage(new Image(), 0, 0)
  e.dataTransfer.setData('deviceTreeNode', JSON.stringify(this.node.data))
  // 添加拖拽dom
  drag.node = this.node
  drag.cloneElm = document.createElement('div')
  drag.cloneElm.append(this.elm.cloneNode(true))
  drag.cloneElm.style.display = 'none'
  drag.cloneElm.children[0].classList.add('dragging-node')
  document.body.append(drag.cloneElm)
}

/* 拖拽中 */
function onDrag(e) {
  window.requestAnimationFrame(() => {
    drag.cloneElm.style.display = 'block'
    drag.cloneElm.style.position = 'absolute'
    drag.cloneElm.style.left = `${e.x + 5}px`
    drag.cloneElm.style.top = `${e.y + 5}px`
  })
}

/* 结束拖拽 */
function onDragEnd() {
  drag.cloneElm.remove()
}

export const draggable: DirectiveOptions = {
  bind(el: any, binding, vnode) {
    let { node, isDraggable } = binding.value
    if (typeof isDraggable === 'function') {
      isDraggable = isDraggable(node)
    }
    el.setAttribute('draggable', isDraggable)
    drag.context = vnode.context
    el.node = node
    el.elm = vnode.elm
    el.ondragstart = onDragStart.bind(el)
    el.ondrag = onDrag.bind(el)
    el.ondragend = onDragEnd.bind(el)
  }
}
