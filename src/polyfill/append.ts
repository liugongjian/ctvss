export default function(arr:any) {
  arr.forEach(function(item:any) {
    // eslint-disable-next-line no-prototype-builtins
    if (item.hasOwnProperty('append')) {
      return
    }
    Object.defineProperty(item, 'append', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function append() {
        let argArr = Array.prototype.slice.call(arguments)
        let docFrag = document.createDocumentFragment()

        argArr.forEach(function(argItem) {
          var isNode = argItem instanceof Node
          docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)))
        })

        this.appendChild(docFrag)
      }
    })
  })
}
