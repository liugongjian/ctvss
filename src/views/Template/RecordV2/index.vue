<template>
  <div class="app-container">
    <el-card ref="deviceWrap" class="device-list-wrap">
      <div class="device-list" :style="{minHeight: `${minHeight}px`}" :class="{'device-list--dragging': dirDrag.isDragging}">
        <div
          class="device-list__handle"
          :style="`left: ${dirDrag.width}px`"
          @mousedown="changeWidthStart($event)"
        />
        <div class="device-list__left" :style="`width: ${dirDrag.width}px`">
          <div class="dir-list__tools">
            <span class="left-title">模板列表</span>
            <el-tooltip class="item new-template" effect="dark" content="新建录制模板" placement="top" :open-delay="300">
              <el-button :disabled="createTemplateDisable" @click="createTemplate">+ 新建</el-button>
            </el-tooltip>
          </div>
          <div ref="dirList" v-loading="loading.template" class="device-list__left" :style="`width: ${dirDrag.width}px`">
            <div class="dir-list" :style="`width: ${dirDrag.width}px`">
              <div v-loading="loading.template" class="template-list">
                <ul>
                  <li v-for="template in templates" :key="template.templateId" :class="{'actived': currentTemplate && (currentTemplate.templateId === template.templateId)}" @click="selectTemplate(template)">
                    <span> {{ template.templateName }}</span><div class="tools">
                      <!-- <el-tooltip class="item" effect="dark" content="编辑平台" placement="top" :open-delay="300">
                        <el-button type="text" @click.stop="editTemplate(template)"><svg-icon name="edit" /></el-button>
                      </el-tooltip> -->
                      <el-tooltip class="item" effect="dark" content="删除模板" placement="top" :open-delay="300">
                        <el-button type="text" @click.stop="deleteTemplate(template)"><svg-icon name="trash" /></el-button>
                      </el-tooltip>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="device-list__right">
          <div v-if="mainCard">
            <el-descriptions v-loading="loading.templateInfo" :column="2" border label-class-name="description__label" content-class-name="description__content">
              <template slot="title">
                <span class="title">模板信息</span>
              </template>
              <template slot="extra">
                <el-button type="text" class="btn-edit" @click="editTemplate(currentTemplate)">编辑</el-button>
              </template>
              <el-descriptions-item label="模板名称">{{ renderTemplateInfo.templateName }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ renderTemplateInfo.createdTime }}</el-descriptions-item>
              <el-descriptions-item label="存储时长">{{ renderTemplateInfo.storageTime / 24 / 60 / 60 + '天' }}</el-descriptions-item>
              <el-descriptions-item label="周期时长">{{ renderTemplateInfo.interval / 60 + '分钟' }}</el-descriptions-item>
              <el-descriptions-item label="录制类别">{{ renderTemplateInfo.recordType === 1 ? '自动录制' : '按需录制' }}</el-descriptions-item>
              <el-descriptions-item label="备注">{{ renderTemplateInfo.description }}</el-descriptions-item>
            </el-descriptions>
            <el-descriptions label-class-name="has-no-colon" :column="1">
              <template slot="title">
                <span class="title">绑定关系</span>
              </template>
              <el-descriptions-item v-if="handleDevice" colon="false">
                <!-- <el-descriptions-item colon="false"> -->
                <el-button type="primary" :disabled="loading.templateDeviceTree" @click="clickBind">+ 绑定设备</el-button>
                <el-button :disabled="loading.templateDeviceTree" @click="delDevice">删除设备</el-button>
              </el-descriptions-item>
            </el-descriptions>
            <div ref="bindContainer" class="bind-container">
              <!-- 已绑定的设备 -->
              <div v-if="defaultDevice" class="bind-body">
                <div class="bind-left">
                  <span class="bind-title-left">
                    已绑定设备
                  </span>
                  <span class="bind-title-right">
                    <span v-if="isDelete">已选中 {{ delDataList.length }} 项</span>
                    <span v-else>已绑定 {{ bindedDeviceNum }} 项</span>
                  </span>
                  <div>
                    <el-tree
                      ref="bindTreeMain"
                      :key="treeKey"
                      v-loading="loading.templateDeviceTree || loading.unbinding"
                      class="right-tree"
                      node-key="id"
                      lazy
                      :show-checkbox="isDelete"
                      highlight-current
                      empty-text="暂无已绑定设备"
                      :load="loadSubDevice"
                      :props="treeProp"
                      :style="`height: ${minTreeHeight}px`"
                      @check-change="handleCheck"
                    >
                      <span
                        slot-scope="{node, data}"
                        class="custom-tree-node"
                        :class="{'online': data.deviceStatus === 'on'}"
                      >
                        <span class="node-name">
                          <status-badge v-if="data.type === 'ipc'" :status="data.streamStatus" />
                          <svg-icon v-if="data.type !== 'dir' && data.type !== 'platformDir'" :name="data.type" width="15" height="15" />
                          <span v-else class="node-dir">
                            <svg-icon name="dir" width="15" height="15" />
                            <svg-icon name="dir-close" width="15" height="15" />
                          </span>
                          {{ node.label }}
                        </span>
                      </span>
                    </el-tree>
                  </div>
                  <div v-if="isDelete" style="margin-top: 20px;">
                    <el-button :disabled="loading.unbinding" type="primary" @click="delSubmit">删除</el-button>
                    <el-button @click="handleUnbindCancel">取消</el-button>
                  </div>
                </div>
                <div v-if="isDelete" class="bind-right">
                  <span class="bind-title-left">
                    已选择设备
                  </span>
                  <div class="tree-block">
                    <el-table
                      :data="delDataList"
                      :height="minTreeHeight"
                    >
                      <el-table-column
                        prop="label"
                        label="设备名"
                      />
                      <el-table-column
                        prop="path"
                        label="设备路径"
                      />
                    </el-table>
                  </div>
                </div>
              </div>
              <!-- 绑定的设备 -->
              <bind-device v-if="bindDevice" :current-template="currentTemplate" @on-close="bindDialogClose" />
            </div>
          </div>
          <div v-if="createOrUpdateTemplate" class="edit-template">
            <create-or-update-template :create-or-update-flag="createOrUpdateFlag" :form-data="currentTemplate" :template-id="currentTemplate.templateId" @on-close="createClose" @on-submit="templateSubmit" />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Ref } from 'vue-property-decorator'
import { getRecordTemplates, queryRecordTemplate, getTemplateDeviceTree, deleteRecordTemplate } from '@/api/template'
import { unbindDeviceRecordTemplateBatch } from '@/api/device'
import StatusBadge from '@/components/StatusBadge/index.vue'
import BindDevice from './components/BindDeviceV2.vue'
import CreateOrUpdateTemplate from './components/CreateOrUpdateTemplate.vue'

@Component({
  name: 'CustomDeviceTree',
  components: {
    BindDevice,
    StatusBadge,
    CreateOrUpdateTemplate
  }
})
export default class extends Vue {
  @Ref('deviceWrap') private deviceWrap
  @Ref('bindContainer') private bindContainer
  @Ref('bindTreeMain') private bindTreeMain

  // 编辑页面参数
  private mainCard = true
  private createOrUpdateTemplate = false
  private createOrUpdateFlag = false

  private isDelete = false
  private handleDevice = true

  private bindDevice = false
  // private unbindDevice = false
  private defaultDevice = false

  private delDataList = []

  private dirDrag = {
    isDragging: false,
    start: 0,
    offset: 0,
    orginWidth: 200,
    width: 250
  }

  private loading = {
    template: false,
    templateInfo: false,
    templateDeviceTree: false,
    unbinding: false
  }

  private treeKey = new Date().getTime()

  private treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf'
  }

  private bindedDeviceNum = 0
  private bindDialogVisible = false
  private createTemplateDisable = false

  private minHeight = null
  private minTreeHeight = null
  private currentTemplate: any = {}
  private deviceListMain: any = []

  private templates: any = []
  private renderTemplateInfo: any = {}

  private mounted() {
    this.handleDevice = true
    this.calMaxHeight()
    window.addEventListener('resize', this.calMaxHeight)
    this.init()
  }

  private destroyed() {
    window.removeEventListener('resize', this.calMaxHeight)
  }

  // 获取1模板列表并初始化2模板信息和3设备树
  private async init() {
    try {
      // 设置初始化展示页面结构
      this.loading.template = true
      let res = await getRecordTemplates({
        pageSize: 999
      }) // 获取模板列表
      this.templates = res.templates
      this.loading.template = false
      this.$nextTick(() => {
        // 默认选中第一个模板
        this.currentTemplate = this.templates[0]
        this.defaultDevice = true
        this.isDelete = false
        this.bindDevice = false
        // 加载第一项的模板信息和设备树
        this.initBindDevice()
        this.initTemplateInfo()
      })
    } catch (e) {
      this.$message.error(e)
    }
  }

  /**
   * 获取模板信息，查询模板信息
   */
  private async initTemplateInfo() {
    try {
      this.loading.templateInfo = true
      let templateInfo = await queryRecordTemplate({
        templateId: this.currentTemplate.templateId
      })
      this.renderTemplateInfo = templateInfo // 渲染模板信息
    } catch (e) {
      this.$message.error(e)
    } finally {
      this.loading.templateInfo = false
    }
  }

  /**
   * 重置已绑定的设备树
   */
  private async initBindDevice() {
    this.treeKey = new Date().getTime()
  }

  /**
   * 选择模板
   */
  private async selectTemplate(template: any) {
    // 设置初始化展示页面结构
    this.bindedDeviceNum = 0
    this.mainCard = true
    this.defaultDevice = true
    this.isDelete = false
    this.bindDevice = false
    this.createOrUpdateTemplate = false
    this.createTemplateDisable = false
    this.handleDevice = true
    this.currentTemplate = template
    this.initBindDevice()
    this.initTemplateInfo()
  }

  /**
  * 设置左侧宽度
  */
  private changeWidthStart(e: MouseEvent) {
    const $dirList: any = this.$refs.dirList
    this.dirDrag.isDragging = true
    this.dirDrag.start = e.x
    this.dirDrag.orginWidth = $dirList.clientWidth

    window.addEventListener('mousemove', (e) => {
      if (!this.dirDrag.isDragging) return
      this.dirDrag.offset = this.dirDrag.start - e.x
      const width = this.dirDrag.orginWidth - this.dirDrag.offset
      if (width < 50) return
      this.dirDrag.width = width
    })
    window.addEventListener('mouseup', () => {
      this.dirDrag.isDragging = false
    })
  }

  /**
   * 计算最大高度
   */
  private calMaxHeight() {
    const documentHeight = document.body.offsetHeight
    if (this.deviceWrap) {
      const size = this.deviceWrap.$el.getBoundingClientRect()
      const top = size.top
      this.minHeight = documentHeight - top - 22
    }

    if (this.bindContainer) {
      const treeSize = this.bindContainer.getBoundingClientRect()
      const treeTop = treeSize.top
      this.minTreeHeight = documentHeight - treeTop - 150
    }
  }

  /**
   * 删除设备
   */
  private delDevice() {
    // 展示右侧table，展示左侧树可选态
    this.isDelete = true
    this.defaultDevice = true
    this.bindDevice = false
    this.handleDevice = false
  }

  /**
   * 加载子节点
   */
  private async loadSubDevice(node: any, resolve: Function) {
    if (node.level === 0) {
      this.loading.templateDeviceTree = true
      const res = await getTemplateDeviceTree({
        templateId: this.currentTemplate.templateId,
        groupId: 0,
        id: 0,
        bind: true
      })
      const root = [{
        label: '全部',
        isLeaf: false,
        id: '-1',
        type: 'group',
        bindSize: 0
      }]
      this.loading.templateDeviceTree = false
      resolve(root)
      this.$nextTick(async() => {
        const rootNode = this.bindTreeMain.getNode('-1')
        this.bindTreeMain.updateKeyChildren('-1', res.dirs)
        rootNode.loaded = true
        rootNode.expanded = true
        // 计算业务组设备总数量
        let total = 0
        res.dirs.forEach((group) => {
          total += group.totalSize
        })
        this.bindedDeviceNum = total
      })
    } else {
      try {
        const res = await this.getSubCheckedTree(node)
        this.$nextTick(() => {
        // 勾选状态下设置
          if (!this.isDelete) return
          this.setChecked(res.dirs)
        })
        return resolve(res)
      } catch (e) {
        resolve([])
      }
    }
  }

  /**
   * 设置勾选状态
   */
  private setNodesChecked(item: any, checked?: boolean) {
    if (checked) {
      // 点击勾选
      this.bindTreeMain.setChecked(item.id, true, true)
    }
  }

  /**
   * 已绑定设备勾选状态设置
   */
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

  /**
   * 删除模板
   */
  private async deleteTemplate(row: any) {
    this.$alertDelete({
      type: '录制模板',
      msg: `确定删除录制模板"${row.templateName}"`,
      method: deleteRecordTemplate,
      payload: { templateId: row.templateId },
      onSuccess: this.init
    })
  }

  /**
   * 递归展开子节点
   */
  private async handleCheck(data: any, isChecked: any) {
    if (isChecked) {
      await this.deepExpand(data.id, isChecked)
    }
    this.delDataList = this.bindTreeMain.getCheckedNodes(true, false)
  }

  /**
   * 获取已绑定子节点
   */
  private async getSubCheckedTree(node: any) {
    try {
      const data: any = node.data
      const rootId = this.getGroupId(node)
      const res = await getTemplateDeviceTree({
        templateId: this.currentTemplate.templateId,
        groupId: rootId,
        id: data.id,
        type: data.type,
        bind: true,
        path: data.path
      })
      return res.dirs
    } catch (e) {
      this.$message.error(e)
    }
  }

  /**
   * 确定接触绑定
   */
  private delSubmit() {
    if (this.delDataList.length === 0) return
    this.$confirm(`您确定要删除${this.delDataList.length}个设备的录制模板吗？点击确定后设备将立刻解绑模板，井停止录像！`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      customClass: 'vss-warning'
    }).then(async() => {
      try {
        this.loading.unbinding = true
        const delDataList = this.delDataList.map(data => {
          const node = this.bindTreeMain.getNode(data.id)
          const rootId = this.getGroupId(node)
          data.groupId = rootId
          return data
        })
        await unbindDeviceRecordTemplateBatch({
          templateId: this.currentTemplate.templateId,
          devices: delDataList
        })
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.delDataList = []
      } catch (e) {
        this.$message.error(e)
      } finally {
        this.loading.unbinding = false
        // 删除完后重新获取绑定设备树
        this.bindedDeviceNum = 0
        this.isDelete = false
        this.defaultDevice = true
        this.handleDevice = true
        this.initBindDevice()
      }
    })
  }

  /**
   * 递归展开当前节点的所有已绑定子节点
   */
  private async deepExpand(id: any, checked: any) {
    const dirTreeNode = this.bindTreeMain && this.bindTreeMain.getNode(id)
    if (!dirTreeNode || dirTreeNode.data.isLeaf || dirTreeNode.loaded) {
      return
    }
    dirTreeNode.loading = true
    const dirs = dirTreeNode && await this.getSubCheckedTree(dirTreeNode)
    this.bindTreeMain.updateKeyChildren(id, dirs)
    if (dirTreeNode) {
      dirTreeNode.loading = false
      dirTreeNode.loaded = true
      dirTreeNode.expanded = true
    }
    for (let i = 0; i < dirs.length; i++) {
      const dir = dirs[i]
      const leftNode = this.bindTreeMain.getNode(dir.id)
      leftNode.checked = true
      if (!dir.isLeaf) {
        await this.deepExpand(dir.id, checked)
      }
    }
  }

  /**
   * 点击'绑定设备'按钮
   */
  private clickBind() {
    this.bindDevice = true
    this.isDelete = false
    this.defaultDevice = false
    this.handleDevice = false
  }

  /**
   * 点击'删除设备'按钮
   */
  private clickUnbind() {
    this.isDelete = true
    this.defaultDevice = true
    this.handleDevice = false
    this.bindDevice = false
  }

  // 取消删除设备
  private handleUnbindCancel() {
    this.isDelete = false
    this.defaultDevice = true
    this.handleDevice = true
  }

  /**
   * 关闭绑定 或 取消绑定设备
   */
  private async bindDialogClose(isBinded: boolean) {
    this.bindDevice = false
    // 切换回默认页面
    this.defaultDevice = true
    this.handleDevice = true
    if (isBinded) {
      // 绑定设备,重新请求设备树
      this.bindedDeviceNum = 0
      this.initBindDevice()
    }
  }

  /**
   * 新建模板
   */
  private createTemplate() {
    // 关闭主页面
    // 展示新建/编辑页面
    this.mainCard = false
    this.createTemplateDisable = true
    this.createOrUpdateTemplate = true
    this.createOrUpdateFlag = true // 新建
  }

  /**
   * 编辑模板
   */
  private editTemplate(template: any) {
    this.currentTemplate = template
    this.mainCard = false
    this.createTemplateDisable = true
    this.createOrUpdateTemplate = true
    this.createOrUpdateFlag = false // 编辑
  }

  /**
   * 关闭新建/编辑模板
   */
  private createClose(isRefresh: any) {
    // 控制关闭新建和编辑分页,激活新建按钮
    this.createTemplateDisable = false
    this.createOrUpdateTemplate = false
    this.mainCard = true
    if (isRefresh) {
      // 更新页面
      this.init()
    }
  }

  /**
   * 提交模板编辑/新建操作
   */
  private templateSubmit(finish: boolean) {
    // 禁止操作模板列表
    if (!finish) {
      this.loading.template = true
    }
    if (finish) {
      this.loading.template = false
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
<style lang="scss">
.edit-template {
  height: 100%;
  overflow: auto;
}

.el-descriptions-item__label.has-no-colon {
  margin-left: -10px;

  &:after {
    content: '';
  }
}

.el-descriptions__body {
  margin-left: 29px;
  margin-right: 29px;
}

</style>
<style lang="scss" scoped>
.right-tree {
  border: 1px solid $borderGrey;
  border-radius: 4px;
  min-height: 400px;
  margin-bottom: 10px;
  overflow: auto;
}

.bind-body {
  display: flex;
}

.bind-right {
  margin-left: 20px;
  width: 50%;
  max-width: 720px;
  height: 400px;
}

.bind-left {
  width: 50%;
  max-width: 720px;
  height: 400px;
}

.tree-block {
  border: 1px $borderGrey solid;
  overflow: auto;
}

.template-list {
  padding: 10px;

  ul {
    margin: 0;
    padding: 0;

    li {
      position: relative;
      list-style: none;
      height: 30px;
      line-height: 30px;
      cursor: pointer;
      border-radius: 4px;
      padding-left: 10px;

      span {
        display: block;
        white-space: nowrap;
        text-overflow: hidden;
        word-break: break-all;
      }

      svg {
        color: $darkGray;
        vertical-align: middle;
        margin-left: 3px;
      }

      .tools {
        position: absolute;
        display: none;
        right: 0;
        top: 0;
        background: $treeHover;

        .el-button {
          padding: 5px;
        }

        .el-button + .el-button {
          margin-left: 0;
        }
      }

      &:hover {
        background: $treeHover;

        .tools {
          display: block;
        }
      }

      &.actived {
        background: $primary;
        color: #fff;

        .tools {
          background: $primary;
        }

        svg {
          color: #fff;
        }
      }
    }
  }
}

.title {
  &:before {
    display: inline-block;
    content: '1';
    color: transparent;
    width: 4px;
    background-color: $primary;
    margin-right: 15px;
    margin-left: 10px;
    margin-top: 20px;
  }
}

.left-title {
  font-size: 16px;
  font-weight: bold;
  display: inline-block;
  margin-top: 30px;
  margin-left: 20px;
}

.device-list__left .dir-list__tools {
  height: 70px;
  text-align: left;
}

.new-template {
  float: right;
  margin-top: 23px;
  margin-right: 5px;
}

.btn-edit {
  position: relative;
  top: 12px;
  right: 20px;
}

.bind-title-left {
  font-size: 15px;
  display: inline-block;
  padding-bottom: 10px;
}

.bind-title-right {
  font-size: 13px;
  float: right;
  color: $textGrey;
}

.custom-tree-node.online .node-name {
  .svg-icon {
    color: #65c465;
  }
}

.device-list__right {
  ::v-deep {
    .description__label {
      min-width: 200px;
    }

    .description__content {
      width: 50%;
      word-break: break-all;
    }
  }

  .bind-container {
    padding: 0 29px;
  }
}
</style>
