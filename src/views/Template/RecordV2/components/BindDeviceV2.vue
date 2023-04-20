<template>
  <div ref="bindWrap" class="bind-wrap">
    <div class="bind-body">
      <div class="bind-body-left">
        <span class="bind-title-left">全部设备</span>
        <span class="bind-title-right">已选中{{ totalCheckedSize }}项</span>
        <el-tree
          ref="bindTree"
          v-loading="loading.deviceTree"
          class="general-tree"
          node-key="id"
          lazy
          highlight-current
          empty-text="暂无设备"
          :load="loadSubDeviceLeft"
          :props="treeProp"
          show-checkbox
          :style="`height: ${minHeight}px`"
          @check="onBindTreeCheck"
        >
          <span
            slot-scope="{node, data}"
            class="custom-tree-node"
            :class="{'has-binded-self': data.bindStatus === 1, 'online': data.deviceStatus === 'on'}"
          >
            <span class="node-name">
              <status-badge v-if="data.type === 'ipc'" :status="data.streamStatus" />
              <svg-icon v-if="data.type !== 'dir' && data.type !== 'platformDir'" :name="data.type" width="15" height="15" :class="{ 'active-icon': data.deviceStatus === 'on' }" />
              <span v-else class="node-dir">
                <svg-icon name="dir" width="15" height="15" />
                <svg-icon name="dir-close" width="15" height="15" />
              </span>
              {{ node.label }}
              <span v-if="node.level === 1">{{ `(已选:${data.checkedSize || data.bindSize} / 总数:${data.totalSize})` }}</span>
              <span v-else>{{ data.type === 'ipc' ? '' : `(${data.checkedSize || data.bindSize} / ${data.totalSize})` }}</span>
              <span v-if="data.bindStatus === 4">
                <el-tooltip effect="dark" :content="'当前设备已绑定模板'+data.templateName" placement="top">
                  <i class="el-icon-info" style="color: #faad15;" />
                </el-tooltip>
              </span>
            </span>
          </span>
        </el-tree>
      </div>
      <div class="bind-body-right">
        <span class="bind-title-left">绑定设备预览</span>
        <el-tree
          ref="previewTree"
          empty-text="暂无已绑定设备"
          class="general-tree"
          :props="treeProp"
          node-key="id"
          :data="previewDeviceList"
          :style="`height: ${minHeight}px`"
          @node-expand="onPreviewTreeExpand"
        >
          <span
            slot-scope="{node, data}"
            class="custom-tree-node"
            :class="{'has-binded-self': data.bindStatus === 1, 'online': data.deviceStatus === 'on'}"
          >
            <span class="node-name">
              <status-badge v-if="data.type === 'ipc'" :status="data.streamStatus" />
              <svg-icon v-if="data.type !== 'dir' && data.type !== 'platformDir'" :name="data.type" width="15" height="15" />
              <span v-else class="node-dir">
                <svg-icon name="dir" width="15" height="15" />
                <svg-icon name="dir-close" width="15" height="15" />
              </span>
              {{ node.label }}
              {{ data.type === 'ipc' ? '' : `(${data.checkedSize || data.bindSize})` }}
            </span>
          </span>
        </el-tree>
      </div>
    </div>
    <div v-if="currentTemplate.recordType === 5" class="bind-body-bottom">
      <el-checkbox v-model="quickStart">绑定手动录制模板后 ，未录制状态的设备立即启动录制。</el-checkbox>
    </div>
    <div slot="footer" class="submit-footer">
      <el-button type="primary" :loading="submitting" :disabled="!submitable" @click="submit">
        确 定
      </el-button>
      <el-button @click="closeDialog(false)">取 消</el-button>
    </div>
    <el-dialog
      width="30%"
      top="20%"
      :visible="hasBindedNode"
      append-to-body
    >
      <i class="el-icon-info" style="color: #faad15;" />
      <span>您选择的设备中，有部分设备已绑定其他模板，确认使用新的模板绑定到这些设备上吗?</span>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :disabled="!submitable" @click="subSubmit">
          确 定
        </el-button>
        <el-button @click="hasBindedNode = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Ref } from 'vue-property-decorator'
import { getTemplateDeviceTree } from '@/api/template'
import { setDeviceRecordTemplateBatch, setViidDeviceRecordTemplateBatch } from '@/api/device'
import StatusBadge from '@/components/StatusBadge/index.vue'
import { cloneDeep } from 'lodash'

@Component({
  name: 'BindDevice',
  components: {
    StatusBadge
  }
})
export default class extends Vue {
  @Prop()private currentTemplate: any
  @Prop()private type: any

  @Ref('bindWrap') private bindWrap
  @Ref('bindTree') private bindTree
  @Ref('previewTree') private previewTree

  private submitable = true
  private hasBindedNode = false
  private minHeight = null

  private loading = {
    deviceTree: false,
    previewTree: false
  }

  private treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf'
  }

  private submitting = false
  private quickStart = false
  private rootNode = {
    label: '全部',
    isLeaf: false,
    id: '-1',
    type: 'group',
    bindSize: 0,
    children: []
  }
  private previewDeviceList: any = [ this.rootNode ]
  private totalCheckedSize = 0

  private get checkedNodes() {
    return this.bindTree.getCheckedNodes(false, true)
  }

  private mounted() {
    this.$nextTick(() => {
      this.calMaxHeight()
    })
    window.addEventListener('resize', this.calMaxHeight)
  }

  private destroyed() {
    window.removeEventListener('resize', this.calMaxHeight)
  }

  /**
   * 计算最大高度
   */
  private calMaxHeight() {
    const size = this.bindWrap.getBoundingClientRect()
    const top = size.top
    const documentHeight = document.body.offsetHeight
    this.minHeight = documentHeight - top - 170
  }

  /**
   * 懒加载左侧  子节点
   */
  private async loadSubDeviceLeft(node: any, resolve: Function) {
    if (node.level === 0) {
      // 加载第一层业务组
      try {
        this.loading.deviceTree = true
        const res = await getTemplateDeviceTree({
          templateId: this.currentTemplate.templateId,
          inProtocol: this.type,
          groupId: 0,
          id: 0,
          bind: false
        })
        const root = [ cloneDeep(this.rootNode) ]
        resolve(root)
        this.$nextTick(async() => {
          const rootNode = this.bindTree.getNode('-1')
          this.bindTree.updateKeyChildren('-1', res.dirs)
          rootNode.loaded = true
          rootNode.expanded = true
          const previewRootNode = this.previewTree.getNode('-1')
          previewRootNode.loaded = true
          previewRootNode.expanded = true
          // 计算业务组设备总数量
          let total = 0
          let bindSize = 0
          res.dirs.forEach((group) => {
            total += group.totalSize
            bindSize += group.bindSize
          })
          if (bindSize < res.bindSize) {
            bindSize = res.bindSize
          }
          this.totalCheckedSize = bindSize
          this.$set(rootNode.data, 'bindSize', bindSize)
          this.$set(rootNode.data, 'totalSize', total)
          this.$set(previewRootNode.data, 'bindSize', bindSize)
          // 同步勾选状态
          this.setChecked(res.dirs)
          this.setChecked(rootNode)
          // 同步到预览树
          this.deepCopy(rootNode)
        })
      } catch (e) {
        resolve([])
      } finally {
        this.loading.deviceTree = false
      }
    } else {
      const dirs = await this.getSubTree(node)
      this.$nextTick(() => {
        this.setChecked(dirs)
        this.setChecked(node)
        node.isLeaf = node.data.isLeaf
      })
      resolve(dirs)
    }
  }

  /**
   * 预览树展开后判断节点是否已加载
   * 如果未加载先加载绑定树
   */
  private onPreviewTreeExpand(data, node) {
    if (node.loaded) {
      return
    }
    const bindTreeNode = this.bindTree.getNode(node.data.id)
    if (!bindTreeNode.loaded) {
      const previewTreeNode = this.previewTree.getNode(node.data.id)
      previewTreeNode.loading = true
      this.loadSubDeviceLeft(node, (children) => {
        const bindTreeNode = this.bindTree.getNode(node.data.id)
        this.bindTree.updateKeyChildren(node.data.id, children)
        bindTreeNode.loaded = true
        bindTreeNode.expanded = true
        previewTreeNode.loading = false
        // 如果绑定树的节点是勾选状态，需要将子节点全部设为勾选状态
        if (bindTreeNode.checked) {
          bindTreeNode.childNodes.forEach(node => {
            node.checked = true
          })
        }
        this.$nextTick(() => {
          this.deepCopy(bindTreeNode)
        })
      })
    } else {
      this.deepCopy(bindTreeNode)
    }
  }

  /**
   * 绑定树勾选变化时触发的回调
   */
  private async onBindTreeCheck(data?: any) {
    this.submitable = false
    const node = this.bindTree.getNode(data.id)
    if (data.id === '-1') {
      // 全选根目录
      for (let i = 0; i < node.childNodes.length; i++) {
        const childNode = node.childNodes[i]
        this.deepCheck(node)
        await this.deepLoad(childNode.data.id, node.checked)
        this.deepCopy(node)
      }
      this.$nextTick(() => {
        this.totalCheckedSize = node.checked ? node.data.totalSize : node.data.checkedSize
      })
    } else if (node.isLeaf || node.loaded) {
      // 如果是叶子节点更新上层, 将上层全部拷贝到预览树
      this.deepCheck(node)
      if (data.id !== '-1') {
        const previewTreeParent = this.findParentNode(node.parent)
        const bindTreeParent = this.bindTree.getNode(previewTreeParent.data.id)
        this.deepCopy(bindTreeParent)
      } else {
        this.deepCopy(node)
      }
    } else if (!node.loaded) {
      // 如果节点还未加载先递归加载当前节点下所有层级的节点
      await this.deepLoad(data.id, node.checked)
      // 加载完后重新将绑定树的节点拷贝到预览树
      await this.onBindTreeCheck(data)
    }
    this.sumCheckedSize(node)
    this.submitable = true
  }

  /**
   * 深度递归查询所有子节点
   */
  private async deepLoad(id: any, checked: any) {
    try {
      const dirTreeNode = this.bindTree && this.bindTree.getNode(id)
      if (!dirTreeNode || dirTreeNode.data.isLeaf) {
        return
      }
      dirTreeNode.loading = true
      const dirs = await this.getSubTree(dirTreeNode)
      this.bindTree.updateKeyChildren(id, dirs)
      this.$nextTick(() => {
        this.setChecked(dirs)
      })
      dirTreeNode.loading = false
      dirTreeNode.loaded = true
      dirTreeNode.expanded = true
      // 只能一层层添加到预览树中
      // this.deepCopy(dirTreeNode)

      for (let i = 0; i < dirs.length; i++) {
        const dir = dirs[i]
        // 半选如何处理
        const node = this.bindTree.getNode(dir.id)
        node.checked = checked
        if (!dir.isLeaf) {
          await this.deepLoad(dir.id, checked)
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 树节点深入拷贝
   */
  private deepCopy(node) {
    const children = node.childNodes
      .filter(childNode => {
        return childNode.checked || childNode.indeterminate
      })
      .map(childNode => {
        return childNode.data
      })
    if (children) {
      this.updatePreviewTree(node.data.id, children)
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        const childNode = this.bindTree.getNode(child.id)
        this.deepCopy(childNode)
      }
    }
  }

  /**
   * 深度递归勾选已绑定的设备（解决el-tree Bug)
   */
  private deepCheck(node) {
    const childNodes = node.childNodes
    for (let i = 0; i < childNodes.length; i++) {
      const childNode = childNodes[i]
      if (childNode.data.disabled) {
        this.bindTree.setChecked(childNode.data.id, true)
      }
      if (childNode.childNodes) {
        this.deepCheck(childNode)
      }
    }
  }

  /**
   * 同步预览树
   * @id 节点ID
   * @children 子节点数组
   */
  private updatePreviewTree(id, children) {
    const previewNode = this.previewTree.getNode(id)
    const bindNode = this.bindTree.getNode(id)

    if (previewNode) {
      // if (targetNode.loaded) return
      this.previewTree.updateKeyChildren(id, children)
      previewNode.loaded = bindNode.loaded
      previewNode.expanded = bindNode.expanded
      previewNode.childNodes.forEach(node => {
        node.isLeaf = node.data.isLeaf
      })
    }
  }

  /**
   * 查询子节点
   */
  private async getSubTree(node: any) {
    try {
      const data: any = node.data
      const rootId = this.getGroupId(node)
      const res = await getTemplateDeviceTree({
        templateId: this.currentTemplate.templateId,
        inProtocol: this.type,
        groupId: rootId,
        id: data.id,
        type: data.type,
        bind: false,
        path: data.path
      })
      return res.dirs
    } catch (e) {
      this.$message.error(e)
    }
  }

  /**
   * 已绑定设备勾选状态设置
   */
  private async setChecked(nodes: any) {
    if (!Array.isArray(nodes)) {
      let item = nodes.data
      this.setNodesChecked(item)
    } else {
      nodes.map((item: any) => {
        this.setNodesChecked(item)
      })
    }
  }

  private setNodesChecked(item: any) {
    if (item.bindStatus === 1) {
      this.bindTree.setChecked(item.id, true, true)
      // 禁用绑定其他模板的节点勾选框
      item.disabled = true
    }
    if (item.bindSize === item.totalSize && item.bindSize > 0) {
      // 默认全选
      this.bindTree.setChecked(item.id, true, true)
    }
    if ((item.bindSize > 0 && item.bindSize < item.totalSize) || (item.checkedSize > 0 && item.checkedSize < item.totalSize)) {
      // 半选
      const halfNode: any = this.bindTree && this.bindTree.getNode(item.id)
      halfNode.indeterminate = true
    }
  }

  /**
   * 计算已钩选的节点数量
   */
  private sumCheckedSize(node) {
    this.sumChildrenCheckedSize(node)
    if (node.parent.data) {
      this.sumParentCheckedSize(node.parent)
    } else if (node.parent.level === 0) {
      const previewRootNode = this.previewTree.getNode('-1')
      previewRootNode.data.bindSize = node.checked ? node.data.totalSize : node.data.bindSize
    }
  }

  /**
   * 计算子孙勾选节点数量
   */
  private sumChildrenCheckedSize(node) {
    if (node.checked) {
      if (!node.isLeaf) {
        this.$set(node.data, 'checkedSize', node.data.totalSize)
      }
    } else {
      this.$set(node.data, 'checkedSize', node.data.bindSize)
    }
    // 递归更新子孙节点
    for (let i = 0; i < node.childNodes.length; i++) {
      const childNode = node.childNodes[i]
      if (!childNode.isLeaf) {
        this.sumChildrenCheckedSize(childNode)
      }
    }
  }

  /**
   * 计算祖先的勾选的节点数量
   */
  private sumParentCheckedSize(parentNode) {
    const totalCheckedSize = parentNode.childNodes && parentNode.childNodes.reduce((total, childNode) => {
      if (childNode.isLeaf && childNode.checked) {
        total++
      } else {
        total += (childNode.data.checkedSize || childNode.data.bindSize)
      }
      return total
    }, 0)
    this.$set(parentNode.data, 'checkedSize', totalCheckedSize)
    // 如果父级数量为0，删除预览树中对应的节点
    if (totalCheckedSize === 0) {
      this.previewTree.remove(parentNode.data.id)
    }
    if (parentNode.parent && parentNode.parent.level !== 0) {
      this.sumParentCheckedSize(parentNode.parent)
    }
    if (parentNode.level === 1) {
      const previewRootNode = this.previewTree.getNode('-1')
      previewRootNode.data.bindSize = totalCheckedSize
      this.totalCheckedSize = totalCheckedSize
    }
  }

  /**
   * 提交锁定
   * */
  private async submit() {
    // 获取当前勾选的数据
    // 筛选是否有绑定其他模板的设备
    const bindedCheck = this.checkedNodes.some((item: any) => {
      return item.bindStatus > 1
    })
    let msg = this.totalCheckedSize > 0 ? `确认将${this.currentTemplate.templateName}模板绑定到${this.totalCheckedSize}个设备上吗？` : `您暂未勾选任何设备`
    if (this.checkedNodes.length > 0 && bindedCheck) {
      msg = '您选择的设备中，有部分设备已绑定其他模板，确认使用新的模板绑定到这些设备上吗？已存在的历史录像过期时间不变，新产生的录像将使用新模板中的存储时长。'
    }
    if (this.totalCheckedSize > 0) {
      this.$confirm(msg, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        customClass: 'vss-warning'
      }).then(async() => {
        await this.subSubmit()
      })
    } else {
      this.$confirm(msg, '提示', {
        confirmButtonText: '确定',
        showCancelButton: false,
        customClass: 'vss-warning'
      })
    }
  }

  private async subSubmit() {
    try {
      this.hasBindedNode = false
      let checkedNodes = this.checkedNodes.filter((item: any) => {
        return item.isLeaf
      })
      // 组装 groupId
      const devices = checkedNodes.map((item: any) => {
        return {
          groupId: this.getGroupId(this.bindTree.getNode(item.id)),
          id: item.id,
          type: item.type,
          inProtocol: item.inProtocol
        }
      })
      await setDeviceRecordTemplateBatch({
        inProtocol: this.type,
        templateId: this.currentTemplate.templateId,
        devices: devices,
        startRecord: this.quickStart
      })
      this.$message.success('批量绑定设备成功！')
      this.$emit('on-close', true)
    } catch (e) {
      this.$message.error(e)
      // 关闭绑定页面
      this.closeDialog(false)
    }
  }

  // 关闭 dialog
  private closeDialog(isBinded: boolean = false) {
    this.$emit('on-close', isBinded)
  }

  /**
   * 查找当前节点在预览树中的祖先节点
   */
  private findParentNode(parent) {
    const previewNode = this.previewTree.getNode(parent.data.id)
    if (previewNode) {
      return previewNode
    } else {
      return parent.parent && this.findParentNode(parent.parent)
    }
  }

  /**
   * 获取当前节点对应业务组节点的id
   */
  private getGroupId(node: any) {
    if (node.level === 2) {
      return node.data.id
    } else {
      return this.getGroupId(node.parent)
    }
  }
}
</script>
<style lang="scss" scoped>
.custom-tree-node {
  position: relative;

  .svg-icon {
    color: $color-grey-15;
    font-size: $text-size-medium;
  }
}

.bind-wrap {
  width: 100%;
  height: 100%;
}

.custom-tree-node.online .node-name {
  .svg-icon {
    color: #65c465;
  }
}

.has-binded-self {
  color: $textGrey;
  cursor: not-allowed;
}

.bind-body {
  display: flex;
}

.bind-body-left {
  width: 50%;
  max-width: 720px;
}

.bind-body-right {
  width: 50%;
  max-width: 720px;
  margin-left: 20px;
}

.bind-title-left {
  display: inline-block;
  margin-bottom: 10px;
  font-size: 15px;
}

.bind-title-right {
  float: right;
  margin-bottom: 10px;
  color: $textGrey;
  font-size: 13px;
}

.general-tree {
  border: 1px solid $borderGrey;
  border-radius: 4px;
  min-height: 400px;
  margin-bottom: 10px;
  padding: 10px;
  overflow: auto;
}

.node-dir {
  .svg-icon {
    display: none;

    &:last-child {
      display: inline;
    }
  }
}

.is-expanded > .el-tree-node__content {
  .node-dir {
    .svg-icon {
      display: none;

      &:first-child {
        display: inline;
      }
    }
  }
}

.submit-footer {
  margin: 20px 0;
}

::v-deep {
  .el-dialog {
    border-radius: 12px;
    box-shadow: 5px 5px 10px #00000054;
  }

  .el-checkbox__input.is-indeterminate .el-checkbox__inner {
    background-color: #fff;
    display: inline-block;
    position: relative;
    border: 1px solid #dcdfe6;
    border-radius: 2px;
    box-sizing: border-box;
    width: 14px;
    height: 14px;
    z-index: 1;
    transition: border-color 0.25s cubic-bezier(0.71, -0.46, 0.29, 1.46), background-color 0.25s cubic-bezier(0.71, -0.46, 0.29, 1.46);

    &:before {
      box-sizing: content-box;
      content: '';
      border: 1px solid $primary;
      border-left: 0;
      border-top: 0;
      left: 4px;
      height: 7px;
      background-color: transparent;
      position: absolute;
      top: 1px;
      width: 3px;
      transition: transform 0.15s ease-in 0.05s, -webkit-transform 0.15s ease-in 0.05s;
      transform: rotate(45deg) scaleY(1);
    }
  }
}

.active-icon {
  color: $color-status-success;
}

.status-badge {
  position: absolute;
  left: -5px;
  width: 6px;
  height: 6px;
  opacity: 0.7;
}
</style>
