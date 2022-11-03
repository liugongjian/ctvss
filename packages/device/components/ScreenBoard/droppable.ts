import { DirectiveOptions } from 'vue'
import { removeClass, addClass } from '@vss/base/utils'

let dropCallbalck: Function
let screenDom: any

function ondragover(e) {
  // prevent default to allow drop
  e.preventDefault()
  addClass(this, 'drag-hover')
}

function ondrop(e) {
  const nodeData = JSON.parse(e.dataTransfer.getData('deviceTreeNode'))
  console.log(dropCallbalck)
  dropCallbalck(nodeData)
  console.log(nodeData)
  removeClass(this, 'drag-hover')
}

function ondragleave() {
  removeClass(this, 'drag-hover')
}

export const droppable: DirectiveOptions = {
  bind(el: any, binding) {
    dropCallbalck = binding.value
    el.ondragover = ondragover.bind(el)
    el.ondrop = ondrop.bind(el)
    el.ondragleave = ondragleave.bind(el)
  }
}
