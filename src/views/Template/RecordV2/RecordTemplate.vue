<template>
  <div class="app-container">
    <el-menu :default-active="type" class="navigation-menu" mode="horizontal" @select="navigatePage">
      <el-menu-item index="video">视频录制模板</el-menu-item>
      <el-menu-item index="viid">视图存储模板</el-menu-item>
    </el-menu>
    <el-card ref="deviceWrap" class="device-list-wrap">
      <div class="device-list" :style="{ minHeight: `${minHeight}px` }" :class="{ 'device-list--dragging': dirDrag.isDragging }">
        <div
          class="device-list__handle"
          :style="`left: ${dirDrag.width}px`"
          @mousedown="changeWidthStart($event)"
        />
        <div class="device-list__left" :style="`width: ${dirDrag.width}px`">
          <div class="dir-list__tools">
            <span class="left-title">模板列表</span>
            <el-tooltip class="item new-template" effect="dark" content="新建模板" placement="top" :open-delay="300">
              <el-button :disabled="createTemplateDisable" @click="createTemplate">+ 新建</el-button>
            </el-tooltip>
          </div>
          <div ref="dirList" v-loading="loading.template" class="template-list__wrap" :style="`width: ${dirDrag.width}px`">
            <div class="dir-list" :style="`width: ${dirDrag.width}px`">
              <div v-loading="loading.template" class="template-list">
                <ul>
                  <li v-for="template in templates" :key="template.templateId" :class="{ 'actived': currentTemplate && (currentTemplate.templateId === template.templateId) }" @click="selectTemplate(template)">
                    <span> {{ template.templateName }}</span>
                    <div class="tools">
                      <!-- <el-tooltip class="item" effect="dark" content="编辑平台" placement="top" :open-delay="300">
                        <el-button type="text" @click.stop="editTemplate(template)"><svg-icon name="edit" /></el-button>
                      </el-tooltip> -->
                      <el-tooltip class="item" effect="dark" content="删除模板" placement="top" :open-delay="300">
                        <el-button :disabled="+template.templateType == 1" type="text" @click.stop="deleteTemplate(template)"><svg-icon name="trash" /></el-button>
                      </el-tooltip>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="device-list__right">
          <div v-if="mainCard && currentTemplate">
            <el-descriptions v-loading="loading.templateInfo" :column="2" border label-class-name="description__label" content-class-name="description__content">
              <template slot="title">
                <span class="title">模板信息</span>
              </template>
              <template slot="extra">
                <el-button :disabled="+currentTemplate.templateType == 1" type="text" class="btn-edit" @click="editTemplate(currentTemplate)">编辑</el-button>
              </template>
              <el-descriptions-item label="模板名称">{{ renderTemplateInfo.templateName }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ renderTemplateInfo.createdTime }}</el-descriptions-item>
              <el-descriptions-item label="存储时长">{{ renderTemplateInfo.storageTime / 24 / 60 / 60 + '天' }}</el-descriptions-item>
              <el-descriptions-item v-if="type === 'video'" label="周期时长">{{ Math.ceil(+renderTemplateInfo.fileDuration / 60) + '分钟' }}</el-descriptions-item>
              <el-descriptions-item v-if="type === 'video'" label="录制类别">{{ renderTemplateInfo.recordType }}</el-descriptions-item>
              <el-descriptions-item label="备注">{{ renderTemplateInfo.description }}</el-descriptions-item>
            </el-descriptions>
            <el-descriptions label-class-name="has-no-colon" :column="1">
              <template slot="title">
                <span class="title">绑定关系</span>
              </template>
              <el-descriptions-item v-if="handleDevice" colon="false">
                <!-- <el-descriptions-item colon="false"> -->
                <el-button type="primary" :disabled="loading.templateDeviceTree" @click="clickBind">+ 绑定设备</el-button>
                <el-button v-if="type === 'video'" :disabled="loading.templateDeviceTree" @click="delDevice">删除设备</el-button>
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
                        slot-scope="{ node, data }"
                        class="custom-tree-node"
                        :class="{ 'online': data.deviceStatus === 'on' }"
                      >
                        <span class="node-name">
                          <status-badge v-if="data.type === 'ipc'" :status="data.streamStatus" />
                          <svg-icon v-if="data.type !== 'dir' && data.type !== 'platformDir'" :name="data.type" width="15" height="15" :class="{ 'active-icon': data.deviceStatus === 'on' }" />
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
              <bind-device v-if="bindDevice" :current-template="currentTemplate" @on-close="bindDialogClose" :type="type" />
            </div>
          </div>
          <div v-if="createOrUpdateTemplate" class="edit-template">
            <create-or-update-template
              v-if="type === 'video'"
              :create-or-update-flag="createOrUpdateFlag"
              :form-data="currentTemplate"
              :template-id="currentTemplate.templateId"
              @on-close="createClose"
              @on-submit="templateSubmit"
            />
            <create-or-update-viid-template
              v-if="type === 'viid'"
              :create-or-update-flag="createOrUpdateFlag"
              :form-data="currentTemplate"
              :template-id="currentTemplate.templateId"
              @on-close="createClose"
              @on-submit="templateSubmit"
            />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script lang="ts">
import axios from 'axios'
import { Component, Vue, Ref, Prop } from 'vue-property-decorator'
import { getRecordTemplates, queryViidRecordTemplate, queryRecordTemplate, getTemplateDeviceTree, deleteRecordTemplate, getViidRecordTemplates, deleteViidRecordTemplate } from '@/api/template'
import { unbindDeviceRecordTemplateBatch } from '@/api/device'
import StatusBadge from '@/components/StatusBadge/index.vue'
import BindDevice from './components/BindDeviceV2.vue'
import CreateOrUpdateTemplate from './components/CreateOrUpdateTemplate.vue'
import CreateOrUpdateViidTemplate from './components/CreateOrUpdateViidTemplate.vue'

@Component({
  name: 'RecordTemplate',
  components: {
    BindDevice,
    StatusBadge,
    CreateOrUpdateTemplate,
    CreateOrUpdateViidTemplate
  }
})
export default class extends Vue {
  @Prop() private type: string

  @Ref('deviceWrap') private deviceWrap
  @Ref('bindContainer') private bindContainer
  @Ref('bindTreeMain') private bindTreeMain
  @Ref('dirList') private dirList

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
  private currentTemplate: any = null
  private deviceListMain: any = []

  private templates: any = null

  private renderTemplateInfo: any = {}
  private axiosSource = null

  private async created() {
    this.handleDevice = true
    this.calMaxHeight()
    window.addEventListener('resize', this.calMaxHeight)
    await this.init()
  }

  private destroyed() {
    window.removeEventListener('resize', this.calMaxHeight)
  }

  // 切换页面
  private navigatePage(index) {
    if (index === 'video') {
      this.$router.push('/template/record-video')
    } else {
      this.$router.push('/template/record-viid')
    }
  }

  // 获取1模板列表并初始化2模板信息和3设备树
  private async init() {
    try {
      // 设置初始化展示页面结构
      this.loading.template = true
      this.$nextTick(async() => {
        let res: any = null
        if(this.type === 'video') {
          res = await getRecordTemplates({
            pageSize: 999
          }) // 获取模板列表
        }
        if(this.type === 'viid') {
          res = await getViidRecordTemplates({
            pageSize: 999
          }) // 获取模板列表
        }
        this.templates = res.templates
        if (this.templates.length) {
          // 默认选中第一个模板
          if (!this.currentTemplate) {
            this.currentTemplate = this.templates[0]
          } else {
            const currentTemplate = this.templates.find(template => template.templateId === this.currentTemplate.templateId)
            this.currentTemplate = currentTemplate || this.templates[0]
          }
          this.$nextTick(() => {
            this.scrollToActived()
          })
          this.defaultDevice = true
          this.isDelete = false
          this.bindDevice = false
          // 加载第一项的模板信息和设备树
          this.initBindDevice()
          this.initTemplateInfo()
        } else {
          this.currentTemplate = null
        }
        this.loading.template = false
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
      let templateInfo: any = null
      if (this.type === 'video') {
        templateInfo = await queryRecordTemplate({
          templateId: this.currentTemplate.templateId
        })
      }
      if (this.type === 'viid') {
        templateInfo = await queryViidRecordTemplate({
          templateId: this.currentTemplate.templateId
        })
      }
      this.renderTemplateInfo = templateInfo // 渲染模板信息
      if (templateInfo.recordType === 1) {
        this.renderTemplateInfo.recordType = '全天录制'
      } else if (templateInfo.recordType === 2) {
        this.renderTemplateInfo.recordType = '循环定时录制'
      } else if (templateInfo.recordType === 3) {
        this.renderTemplateInfo.recordType = '指定时间录制'
      } else if (templateInfo.recordType === 4) {
        this.renderTemplateInfo.recordType = '事件录制'
      } else if (templateInfo.recordType === 5) {
        this.renderTemplateInfo.recordType = '手动录制'
      }
      this.renderTemplateInfo.storageTime = templateInfo.storageTime
      this.$nextTick(this.calMaxHeight)
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
    this.axiosSource.cancel()
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
      this.axiosSource = axios.CancelToken.source()
      const res = await getTemplateDeviceTree({
        templateId: this.currentTemplate.templateId,
        inProtocol: this.type,
        groupId: 0,
        id: 0,
        bind: true
      }, this.axiosSource.token)
      this.loading.templateDeviceTree = false
      if (res.dirs.length) {
        const root = [{
          label: '全部',
          isLeaf: false,
          id: '-1',
          type: 'group',
          bindSize: 0
        }]
        resolve(root)
        this.$nextTick(async() => {
          const rootNode = this.bindTreeMain && this.bindTreeMain.getNode('-1')
          if (!rootNode) return
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
        resolve([])
      }
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
      const item = nodes.data
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
    if (this.type === 'video') {
      this.$alertDelete({
        type: '视频录制模板',
        msg: `确定删除视频录制模板"${row.templateName}"`,
        method: deleteRecordTemplate,
        payload: { templateId: row.templateId },
        onSuccess: this.init
      })
    }
    if (this.type === 'viid') {
      this.$alertDelete({
        type: '视图存储模板',
        msg: `确定删除视图存储模板"${row.templateName}"`,
        method: deleteViidRecordTemplate,
        payload: { templateId: row.templateId },
        onSuccess: this.init
      })
    }
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
        inProtocol: this.type,
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
    this.$confirm(`您确定要删除${this.delDataList.length}个设备的录制模板吗？点击确定后设备将立刻解绑模板，并停止录像！`, '提示', {
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
  private createClose(payload: any) {
    // 控制关闭新建和编辑分页,激活新建按钮
    this.createTemplateDisable = false
    this.createOrUpdateTemplate = false
    this.mainCard = true
    if (payload.isRefresh) {
      // 更新页面
      this.currentTemplate = {
        templateId: payload.templateId
      }
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

  /**
   * 滚动条跳转到选中位置
   */
  private scrollToActived() {
    const activedItem = this.dirList.querySelector('li.actived')
    const offsetTop = activedItem.offsetTop
    this.dirList.scrollTop = offsetTop
  }
}
</script>
<style lang="scss">
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

.el-menu--horizontal > .el-menu-item:not(.is-disabled):hover,
.el-menu--horizontal > .el-menu-item:not(.is-disabled):focus {
  background-color: transparent;
}

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
.navigation-menu {
  background: none;
  margin-bottom: 12px;

  .el-menu-item {
    height: 40px;
    line-height: 40px;
  }
}

.right-tree {
  border: 1px solid $borderGrey;
  border-radius: 4px;
  min-height: 400px;
  margin-bottom: 10px;
  padding: 10px;
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

  ::v-deep .el-table {
    min-height: 400px;
  }
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

.device-list {
  height: 500px;
}

.device-list__left {
  display: flex;
  flex-direction: column;

  .dir-list__tools {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    box-sizing: content-box;

    .left-title {
      font-size: 16px;
      font-weight: bold;
      display: inline-block;
      margin-left: 20px;
    }

    .new-template {
      margin-right: 10px;
    }
  }

  .template-list__wrap {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
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
}

.btn-edit {
  position: relative;
  top: 12px;
  right: 29px;
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

.device-list__right {
  overflow: auto;

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

.custom-tree-node {
  position: relative;

  .svg-icon {
    color: $color-grey-15;
    font-size: $text-size-medium;
  }
}
</style>
