const draggable = {
  inserted: function(el, binding) {
    el.style.cursor = 'move'
    el.onmousedown = function(e) {
      if (e.target.classList.contains('axis__canvas')) {
        return
      }
      let disx = e.pageX - el.offsetLeft
      let disy = e.pageY - el.offsetTop
      const pw = parseInt(window.getComputedStyle(el.parentElement).width)
      const ph = parseInt(window.getComputedStyle(el.parentElement).height)
      const ew = parseInt(window.getComputedStyle(el).width)
      const eh = parseInt(window.getComputedStyle(el).height)
      document.onmousemove = function(e) {
        let x = e.pageX - disx
        let y = e.pageY - disy
        let maxX = pw - ew
        let maxY = ph - eh
        if (x < 0) {
          x = 0
        } else if (x > maxX && maxX > 0) {
          x = maxX
        }

        if (y < 0) {
          y = 0
        } else if (y > maxY && maxY > 0) {
          y = maxY
        }

        el.style.left = x + 'px'
        el.style.top = y + 'px'
        binding.value(binding.arg, x, y)
      }
      document.onmouseup = function() {
        document.onmousemove = document.onmouseup = null
      }
    }
  }
}
export default draggable
