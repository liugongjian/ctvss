import { Component, Vue } from 'vue-property-decorator'
import * as _ from 'lodash'

@Component
export default class Validate extends Vue {
  public errorNodesData = []
  public mode = 'vgroup'
  public dirDigits = [2, 4, 6, 8]
  public gbIdMode = 'vgroup'

  public checkGbIdDuplicated(treeList) {
    this.errorNodesData = []
    const res = []
    treeList.forEach(item => {
      res.push(item)
      res.push(...this.flatTree(item))
    })
    const duplicate = []
    res.forEach(x => {
      const duplicateArr = res.filter(y => x.upGbId === y.upGbId)
      if (duplicateArr.length > 1) {
        duplicate.push(x)
      }
    })

    this.errorNodesData = duplicate

    return this.errorNodesData.length > 1
  }

  // 树扁平化
  public flatTree(parent) {
    let arr = []
    if (parent.children) {
      arr = _.cloneDeep(parent.children)
      parent.children.forEach(item => {
        if (item.children) {
          arr.push(...this.flatTree(item))
        }
      })
    }
    return arr
  }

  public checkDirDigit(treeList) {
    this.errorNodesData = []
    const res = []
    treeList.forEach(item => {
      res.push(item)
      res.push(...this.flatTree(item))
    })
    const errorDirNodeData = []
    res.forEach(x => {
      if (x.type === 'top-group' || x.type === 'dir') {
        // 目录校验
        if (this.mode === 'vgroup' && x.upGbId.length !== 20) {
          errorDirNodeData.push(x)
        } else if (this.mode === 'district' && !this.dirDigits.includes(x.upGbId.length)) {
          errorDirNodeData.push(x)
        }
      } else {
        // 设备校验
        if (x.upGbId.length !== 20) {
          errorDirNodeData.push(x)
        }
      }
    })
    this.errorNodesData = errorDirNodeData
    return this.errorNodesData.length > 0
  }

  public checkNumberOnly(treeList) {
    this.errorNodesData = []
    const res = []
    treeList.forEach(item => {
      res.push(item)
      res.push(...this.flatTree(item))
    })
    const errorDirNodeData = []
    const regx = /^\+?[0-9][0-9]*$/
    res.forEach(x => {
      const isNumber = regx.test(x.upGbId)
      if (!isNumber) {
        errorDirNodeData.push(x)
      }
    })
    this.errorNodesData = errorDirNodeData
    return this.errorNodesData.length > 0
  }

  public generatePrefixVal(cur, origin) {
    let index = -1
    for (let i = cur.length - 1; i >= 0; i--) {
      if (cur[i] !== origin[i]) {
        index = i % 2 === 1 ? i : i + 1
        break
      }
    }
    return cur.substring(0, index + 1)
  }

  public rootInput(node, data, val) {
    data.upGbId = val
    this.$nextTick(() => {
      if (this.gbIdMode === 'district' && data.type !== 'ipc') {
        const prefixCur = val.substr(0, 8)
        const prefixOrigin = data.upGbIdOrigin.substr(0, 8)
        const prefix8 = this.generatePrefixVal(prefixCur, prefixOrigin)
        if (val.length % 2 === 0) {
          if (prefixCur === prefixOrigin) {
            if (val !== data.upGbIdOrigin) {
              // 如果前8位相同，改了其它位，则不做变更
              return
            }
            // 如果前8位相同，也没有改其它位，则把前8位覆盖成当前输入的前8位
            this.changeGbIdDistrictRoot(data, prefixCur)
          } else {
            // 如果前8位不同，则把前8位覆盖成改变了的位数的偶数位
            this.changeGbIdDistrictRoot(data, prefix8)
          }
        }
      }
    })
  }

  public changeGbIdDistrictRoot(data, val) {
    if (data.children && data.children.length > 0) {
      data.children.forEach(child => {
        child.upGbId = this.generateDistrictGbId(val, child.upGbId)
        this.changeGbIdDistrictRoot(child, val)
      })
    }
  }

  public generateDistrictGbId(rootId, leafId) {
    const rootIdLength = rootId.length // 8 只修改前8位
    const leafIdLength = leafId.length // > 8
    if (rootIdLength >= leafIdLength) {
      return rootId
    }
    return rootId + leafId.substring(rootIdLength)
  }
}
