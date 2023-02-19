<template>
  <div class="bind-wrap">
    <div class="bind-body">
      <div class="bind-body-left">
        <span class="bind-title-left">全部设备</span>
        <span class="bind-title-right">已选中{{ checkedNum }}项</span>
        <el-tree
          ref="bindTree"
          v-loading="loading.deviceTree"
          class="general-tree"
          node-key="id"
          lazy
          highlight-current
          empty-text="暂无已绑定设备"
          :load="loadSubDeviceLeft"
          :props="treeProp"
          show-checkbox
          @check="onBindTreeCheck"
        >
          <span
            slot-scope="{node, data}"
            class="bind-device-tree"
            :class="{'has-binded-self': data.bindStatus === 1}"
          >
            <span class="node-name">
              <svg-icon v-if="data.type !== 'dir' && data.type !== 'platformDir'" :name="data.type" width="15" height="15" />
              <span v-else class="node-dir">
                <svg-icon name="dir" width="15" height="15" />
                <svg-icon name="dir-close" width="15" height="15" />
              </span>
              {{ node.label }}
              {{ data.totalSize === 0 ? '' : '(' + data.totalSize + ')' }}
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
        <!-- <span class="bind-title-right">已选中{{}}项</span> -->
        <el-tree
          ref="previewTree"
          empty-text="暂无已绑定设备"
          class="general-tree"
          :props="treeProp"
          node-key="id"
          :data="previewDeviceList"
          @node-expand="onPreviewTreeExpand"
        >
          <span
            slot-scope="{node, data}"
            class="bind-device-tree"
            :class="{'has-binded-self': data.bindStatus === 1, 'online': data.deviceStatus === 'on'}"
          >
            <span class="node-name">
              <svg-icon v-if="data.type !== 'dir' && data.type !== 'platformDir'" :name="data.type" width="15" height="15" />
              <span v-else class="node-dir">
                <svg-icon name="dir" width="15" height="15" />
                <svg-icon name="dir-close" width="15" height="15" />
              </span>
              <status-badge v-if="data.type === 'ipc'" :status="data.streamStatus" />
              {{ node.label }}
            </span>
          </span>
        </el-tree>
      </div>
    </div>
    <div class="bind-body-bottom">
      <el-checkbox v-model="quickStart">绑定该按需模板后，未录制状态的设备立即启动录制。</el-checkbox>
    </div>
    <div slot="footer" class="dialog-footer" style="margin-top: 20px;">
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
import { getRecordTemplates, queryRecordTemplate, getTemplateDeviceTree, getTemplateNodeDevice } from '@/api/template'
import { setDeviceRecordTemplateBatch } from '@/api/device'
import StatusBadge from '@/components/StatusBadge/index.vue'
import { cloneDeep } from 'lodash'

@Component({
  name: 'BindDevice',
  components: {
    StatusBadge
  }
})
export default class extends Vue {
  @Prop()
  private currentTemplate: any

  private submitable = false
  private hasBindedNode = false

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
    label: '根目录',
    isLeaf: false,
    id: '-1',
    type: 'group',
    children: []
  }
  private previewDeviceList: any = [ this.rootNode ]

  private supplyNode = []
  private expandedNodes = []

  private get checkedNodes() {
    const leftTree: any = this.$refs.bindTree
    return leftTree.getCheckedNodes(false, true)
  }

  private get checkedNum() {
    const leftTree: any = this.$refs.bindTree
    const checkedNodes = leftTree ? leftTree.getCheckedNodes(true) : []
    return checkedNodes.length
  }

  @Ref('bindTree') private bindTree
  @Ref('previewTree') private previewTree

  /**
   * 懒加载左侧  子节点
   */
  private async loadSubDeviceLeft(node: any, resolve: Function) {
    if (node.level === 0) {
      try {
        this.loading.deviceTree = true
        this.loading.previewTree = true
        this.submitable = false
        const res = await getTemplateDeviceTree({
          templateId: this.currentTemplate.templateId,
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

          this.setChecked(res.dirs)
          // 同步到预览树
          this.deepCopy(rootNode)
        })
      } catch (e) {
        resolve([])
      } finally {
        this.loading.deviceTree = false
        this.loading.previewTree = false
        this.submitable = true
      }
    } else {
      const dirs = await this.getSubTree(node)
      this.$nextTick(() => {
        this.setChecked(dirs)
      })
      resolve(dirs)
      // 同步到预览树
      // this.updatePreviewTree(node.data.id, dirs)
    }
  }

  /**
   * 预览树展开后判断节点是否已加载
   * 如果未加载先加载绑定树
   */
  private onPreviewTreeExpand(data, node) {
    if (!node.loaded) {
      this.loadSubDeviceLeft(node, (children) => {
        const bindTreeNode = this.bindTree.getNode(node.data.id)
        this.bindTree.updateKeyChildren(node.data.id, children)
        bindTreeNode.loaded = true
        bindTreeNode.expanded = true
        this.$nextTick(() => {
          this.deepCopy(bindTreeNode)
        })
      })
    }
  }

  /**
   * 绑定树勾选变化时触发的回调
   */
  private async onBindTreeCheck(data?: any) {
    const node = this.bindTree.getNode(data.id)
    // 如果是叶子节点更新上层
    if (node.isLeaf || node.loaded) {
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
      this.onBindTreeCheck(data)
    }
  }

  // 递归展开所有业务组 只加载
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
      this.deepCopy(dirTreeNode)

      // this.setFilter()
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
    } finally {
      this.submitable = true
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

  // 已绑定设备勾选状态设置
  private async setChecked(nodes: any, checked?: boolean) {
    if (!Array.isArray(nodes)) {
      let item = nodes.data
      this.setNodesChecked(item, checked)
    } else {
      nodes.map((item: any) => {
        this.setNodesChecked(item, checked)
      })
    }
  }

  private setNodesChecked(item: any, checked?: boolean) {
    if (item.bindStatus === 1) {
      this.bindTree.setChecked(item.id, true, true)
      // 禁用绑定其他模板的节点勾选框
      item.disabled = true
    }
    if (item.bindSize === item.totalSize && item.bindSize > 0) {
      // 默认全选
      this.bindTree.setChecked(item.id, true, true)
    }
    if (item.bindSize > 0 && item.bindSize < item.totalSize) {
      // 半选
      const halfNode: any = this.bindTree && this.bindTree.getNode(item.id)
      halfNode.indeterminate = true
    }
    if (checked) {
      // 点击勾选
      this.bindTree.setChecked(item.id, true, true)
    }
  }

  // 提交锁定
  /**
   * 虚拟业务组使用   inprotocol === vgroup 判断
   * roleid = type
   * */
  private async submit() {
    // 获取当前勾选的数据
    // console.log('勾选的数据    ', this.checkedNodes)
    // 筛选是否有绑定其他模板的设备
    const bindedCheck = this.checkedNodes.some((item: any) => {
      return item.bindStatus > 1
    })
    let msg = '您选择的设备中，有部分设备已绑定其他模板，确认使用新的模板绑定到这些设备上吗?'
    if (bindedCheck) {
      msg = '您选择的设备中，有部分设备已绑定其他模板，确认使用新的模板绑定到这些设备上吗？这些设备在切换新模板时，已存在的历史录像将修改过期时间，使用新的模板存储时长策略。'
    }
    this.$confirm(msg, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async() => {
      await this.subSubmit()
    })
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
          groupId: this.getRootId(this.bindTree.getNode(item.id)),
          id: item.id,
          type: item.type,
          inProtocol: item.inProtocol,
          startRecord: this.quickStart
        }
      })
      await setDeviceRecordTemplateBatch({
        templateId: this.currentTemplate.templateId,
        devices: devices
      })
      this.$message.success('批量绑定设备成功！')
      this.$emit('on-close', true)
    } catch (e) {
      this.$message.error(e)
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
.bind-wrap {
  width: 100%;
  height: 100%;
}

.bind-device-node.online .node-name {
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
  width: 340px;
}

.bind-body-right {
  width: 340px;
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
  height: 400px;
  margin-bottom: 10px;
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
</style>
