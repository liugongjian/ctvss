import { DirectiveOptions } from 'vue'
import { removeClass, addClass } from '@/utils'

const drag: any = {
  isDragging: false,
  context: null,
  node: null,
  cloneElm: null
}

function onMouseDown() {
  drag.isDragging = true
  drag.node = this.node
  drag.cloneElm = this.elm.cloneNode(true)
  document.body.append(drag.cloneElm)
  addClass(document.querySelector('.screen-grid'), 'dragging-node')
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e) {
  drag.cloneElm.style.position = 'absolute'
  drag.cloneElm.style.left = `${e.x + 10}px`
  drag.cloneElm.style.top = `${e.y + 10}px`
}

function onMouseUp(e) {
  drag.isDragging = false
  let target = e.target
  while (target) {
    if (target.className.startsWith('screen-item')) {
      break
    }
    target = target.parentElement
  }
  if (target) {
    drag.context.screenManager.openTreeItem(drag.node.data, null, parseInt(target.dataset.index))
  }
  drag.cloneElm.remove()
  removeClass(document.querySelector('.screen-grid'), 'dragging-node')
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

export const dropScreen: DirectiveOptions = {
  bind(el: any, binding, vnode) {
    drag.context = vnode.context
    el.node = binding.value
    el.elm = vnode.elm
    el.addEventListener('mousedown', onMouseDown.bind(el))
  },

  unbind(el: HTMLElement) {
    el.removeEventListener('mousedown', onMouseDown)
  }
}
