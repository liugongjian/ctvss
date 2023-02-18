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
          @check-change="bindCheck"
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
          v-loading="loading.previewTree"
          lazy
          empty-text="暂无已绑定设备"
          class="general-tree"
          :props="treeProp"
          node-key="id"
          :load="loadSubDeviceLeft"
          :filter-node-method="filterTree"
        >
          <!-- :data="previewDeviceList" -->
          <!-- :data="deviceList" -->
          <!-- :load="loadSubDeviceRight" -->
          <!-- :default-expanded-keys="expandedNodes" -->
          <!-- @node-expand="setExpand" -->
          <!-- @node-collapse="setCollapse" -->
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
              {{ data.totalSize === 0 ? '' : '(' + data.totalSize + ')' }}
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

  private time = (new Date()).getTime()

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
  private previewDeviceList: any = []

  private supplyNode = []
  private expandedNodes = []

  private checkedNum = 0

  private get checkedNodes() {
    const leftTree: any = this.$refs.bindTree
    return leftTree.getCheckedNodes(false, true)
  }

  private getCheckedNum() {
    const leftTree: any = this.$refs.bindTree
    const checkedNodes = leftTree ? leftTree.getCheckedNodes(true) : []
    console.log('已勾选的节点', checkedNodes)
    this.checkedNum = checkedNodes.length
  }

  @Ref('bindTree') private bindTree
  @Ref('previewTree') private previewTree

  private async created() {
    // this.getAllDevice()
  }

  // 左侧获取  全部  设备
  // private async getAllDevice(init?: boolean, node?: any) {
  //   let templateId = node && node.templateId
  //   let type = node && node.type
  //   let path = node && node.path
  //   let id = node && node.id
  //   try {
  //     this.loading.deviceTree = true
  //     this.submitable = true
  //     const res = await getTemplateDeviceTree({
  //       templateId: templateId || this.currentTemplate.templateId,
  //       groupId: 0,
  //       id: id || 0,
  //       type: type,
  //       path: path,
  //       bind: false
  //     })
  //     this.deviceList = res.dirs
  //     res.dirs.map(async(item: any) => {
  //       if (item.bindSize > 0) {
  //         // 具有默认勾选项的节点进行递归加载
  //         if (item.bindStatus > 0 || item.bindSize === item.totalSize) {
  //           // 全选态
  //           await this.deepExpand(item.id, true)
  //         }
  //         if (item.bindSize > 0 && item.bindSize < item.totalSize) {
  //           // 半选
  //           await this.deepExpand(item.id, true)
  //         }
  //       }
  //       // 虚拟业务组添加请求头
  //       if (item.inProtocol === 'vgroup') {
  //         // 添加第一级子节点查询标识
  //         item.vgroup = true
  //         item.roleId = item.id
  //       }
  //     })
  //     this.$nextTick(() => {
  //       // 设置已绑定设备的勾选状态
  //       // 区分勾选状态
  //       this.setChecked(res.dirs)
  //       this.setFilter()
  //     })
  //   } catch (e) {
  //     this.$message.error(e)
  //   } finally {
  //     this.loading.deviceTree = false
  //     this.submitable = false
  //   }
  // }

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
    console.log('...set   ☀', item.label, item)
    if (item.bindStatus === 1) {
      console.log('禁用    ', item.label)
      // 禁用绑定其他模板的节点勾选框
      item.disabled = true
      this.bindTree.setChecked(item.id, true, true)
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

  private setFilter() {
    this.$nextTick(() => {
      // 获取当前状态下所有被勾选的节点数组
      const currentTree = this.bindTree && this.bindTree.getCheckedNodes(false, true)
      // 过滤得到右侧预览树
      this.previewTree && this.previewTree.filter(currentTree)
    })
  }

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
        this.previewDeviceList = res.dirs
        this.checkedNum = res.bindSize
        // updateKey
        resolve(res.dirs)
        this.$nextTick(async() => {
          this.setChecked(res.dirs)
          this.setFilter()
          // 设置已绑定设备的勾选状态
          // 区分勾选状态
          for (let i = 0; i < res.dirs.length; i++) {
            const item = res.dirs[i]
            if (item.bindSize > 0) {
              await this.deepExpand(item.id, false)
            }
          }
          // this.setChecked(res.dirs)
          // this.setFilter()
        })
      } catch (e) {
        resolve([])
      } finally {
        this.loading.deviceTree = false
        this.loading.previewTree = false
        this.submitable = true
      }
    } else {
      // 获取父级节点id
      try {
        this.submitable = false
        const res = await this.getSubTree(node)
        this.$nextTick(() => {
          // 设置已绑定设备的勾选状态
          this.setChecked(res)
          this.setFilter()
        })
        return resolve(res)
      } catch (e) {
        resolve([])
      } finally {
        this.submitable = true
      }
    }
  }

  // 右侧懒加载
  // 需要左侧去加载，更新左侧数据
  private async loadSubDeviceRight(node: any, resolve: Function) {
    resolve([])
  }

  // 获取当前节点对应根节点的id
  private getRootId(node: any) {
    while (node.level !== 1) {
      return this.getRootId(node.parent)
    }
    return node.data.id
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
    }).catch(() => {})
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

  // 勾选的变化
  private async bindCheck(data?: any, isChecked?: boolean) {
    if (isChecked) {
      await this.deepExpand(data.id, isChecked)
    }
    // 获取勾选项数目
    this.getCheckedNum()
    // 获取当前状态下所有被勾选的节点数组
    this.setFilter()
  }

  // 过滤树
  private filterTree(selectedList: any, data: any) {
    let res = selectedList.filter((item: any) => {
      return item.id === data.id
    })
    return res.length > 0
  }

  // 递归展开所有业务组 只加载
  private async deepExpand(id: any, checked: any) {
    try {
      const dirTreeNode = this.bindTree && this.bindTree.getNode(id)
      if (!dirTreeNode || dirTreeNode.data.isLeaf || dirTreeNode.loaded) {
        return
      }
      dirTreeNode.loading = true
      // this.submitable = true
      const dirs = dirTreeNode && await this.getSubTree(dirTreeNode)
      this.bindTree.updateKeyChildren(id, dirs)
      dirTreeNode.loading = false
      dirTreeNode.loaded = true
      this.previewTree.updateKeyChildren(id, dirs)
      // const previewTreeNode = this.previewTree.getNode(id)
      // if (dirTreeNode) {
      //   previewTreeNode.loading = false
      //   previewTreeNode.loaded = true
      //   // previewTreeNode.expanded = true
      // }

      this.setFilter()
      for (let i = 0; i < dirs.length; i++) {
        const dir = dirs[i]
        // 半选如何处理
        console.log('deep    set   checked  🐕', dir, checked) // checked应该是只有点击勾选的时候才有
        const leftNode = this.bindTree.getNode(dir.id)
        checked && this.setChecked(leftNode, true)
        if (!dir.isLeaf) {
          await this.deepExpand(dir.id, checked)
        }
      }
    } catch (e) {
      console.log(e)
    } finally {
      this.submitable = true
    }
  }

  // 获取子节点
  private async getSubTree(node: any) {
    try {
      const data: any = node.data
      const rootId = this.getRootId(node)
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
