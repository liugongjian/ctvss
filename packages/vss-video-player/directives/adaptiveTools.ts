import { DirectiveOptions } from 'vue'
import { removeClass, addClass } from '@/utils'

/**
 * 鼠标进入回调
 */
function onMouseOver() {
  this.timer && clearTimeout(this.timer)
  showTools.call(this)
}

/**
 * 鼠标移出回调
 */
function onMouseOut() {
  setMouseEvent.call(this, 500)
}

/**
 * 鼠标移动回调
 */
function onMouseMove() {
  const eventTarget: EventTarget = window.event?.target
  if (checkIsVideo(eventTarget)) {
    setMouseEvent.call(this, 3000)
  }
}

/**
 * 延时隐藏工具栏
 * @param delay 延时时间
 */
function setMouseEvent(delay: number) {
  this.timer && clearTimeout(this.timer)
  showTools.call(this)
  this.timer = setTimeout(() => {
    hiddenTools.call(this)
  }, delay)
}

/**
 * 校验鼠标是否指向视频
 * @param dom 鼠标指向的DOM元素
 * @returns 校验结果
 */
function checkIsVideo(dom: EventTarget) {
  if (/player__container/.test((dom as HTMLElement).parentElement.className)) {
    return true
  } else {
    return false
  }
}

/**
 * 隐藏player__wrap工具栏与头部
 */
function hiddenTools() {
  addClass(this, 'player__wrap--hidden cursor--hidden')
  // 去除tooltip（可能出现tooltip隐藏不了）
  // const tooltipDoms = document.getElementsByClassName('el-tooltip__popper')
  // Array.from(tooltipDoms).forEach((dom: any) => {
  //   dom.style.display = 'none'
  // })
}

/**
 * 显示player__wrap工具栏与头部
 */
function showTools() {
  removeClass(this, 'player__wrap--hidden cursor--hidden')
}

export const adaptiveTools: DirectiveOptions = {
  bind(el: HTMLElement) {
    el.setAttribute('timer', null)
    hiddenTools.call(el)
    el.addEventListener('mouseover', onMouseOver.bind(el))
    el.addEventListener('mouseout', onMouseOut.bind(el))
    el.addEventListener('mousemove', onMouseMove.bind(el))
  },

  unbind(el: HTMLElement) {
    showTools.call(el)
    el.removeEventListener('mouseover', onMouseOver)
    el.addEventListener('mouseout', onMouseOut)
    el.addEventListener('mousemove', onMouseMove)
  }
}
