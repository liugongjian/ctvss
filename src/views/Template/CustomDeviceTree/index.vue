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
          <div v-loading="loading.template" ref="dirList" class="device-list__left" :style="`width: ${dirDrag.width}px`">
            <div class="dir-list" :style="`width: ${dirDrag.width}px`">
              <div v-loading="loading.template" class="template-list">
                <ul>
                  <li v-for="template in templates" :key="template.templateId" :class="{'actived': currentTemplate && (currentTemplate.templateId === template.templateId)}" @click="selectTemplate(template)">
                    <span> {{ template.templateName }}</span><div class="tools">
                      <el-tooltip class="item" effect="dark" content="编辑平台" placement="top" :open-delay="300">
                        <el-button type="text" @click.stop="editTemplate(template)"><svg-icon name="edit" /></el-button>
                      </el-tooltip>
                      <el-tooltip class="item" effect="dark" content="删除平台" placement="top" :open-delay="300">
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
            <el-descriptions :column="2" border v-loading="loading.templateInfo">
              <template slot="title">
                <span class="title">模板信息</span>
              </template>
              <template slot="extra">
                <el-button type="text" class="btn-edit" @click="editTemplate(currentTemplate)">编辑</el-button>
              </template>
              <el-descriptions-item label="模板名称">{{ renderTemplateInfo.templateName }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ renderTemplateInfo.createdTime }}</el-descriptions-item>
              <el-descriptions-item label="存储时长">{{ renderTemplateInfo.storageTime / 24 / 60 / 60 }}</el-descriptions-item>
              <el-descriptions-item label="周期时长">{{ renderTemplateInfo.interval }}</el-descriptions-item>
              <el-descriptions-item label="录制类别">{{ renderTemplateInfo.recordType }}</el-descriptions-item>
              <el-descriptions-item label="备注">{{ renderTemplateInfo.description }}</el-descriptions-item>
            </el-descriptions>
            <el-descriptions labelClassName="has-no-colon" :column="1">
              <template slot="title">
                <span class="title">绑定关系</span>
              </template>
              <!-- <el-descriptions-item v-if="handleDevice" colon="false"> -->
              <el-descriptions-item colon="false">
                <el-button type="primary" :disabled="loading.templateDeviceTree" @click="clickBind">+ 绑定设备</el-button>
                <el-button :disabled="loading.templateDeviceTree" @click="delDevice">删除设备</el-button>
              </el-descriptions-item>
              <el-descriptions-item v-if="defaultDevice" colon="false">
                <div class="bind-left">
                  <span class="bind-title-left">
                    已绑定设备
                  </span>
                  <span class="bind-title-right">
                    已绑定 {{ bindedDeviceNum }} 项
                  </span>
                  <div class="tree-block">
                    <el-tree
                      ref="bindTreeMain"
                      :data="deviceListMain"
                      node-key="id"
                      lazy
                      :show-checkbox="isDelete"
                      v-loading="loading.templateDeviceTree || loading.unbinding"
                      highlight-current
                      empty-text="暂无已绑定设备"
                      :load="loadSubDevice"
                      @check-change="handleCheck"
                    >
                      <span
                        slot-scope="{node, data}"
                        class="custom-tree-node"
                        :class="{'online': data.deviceStatus === 'on'}"
                      >
                        <span class="node-name">
                          <status-badge v-if="data.type === 'ipc'" :status="data.streamStatus" />
                          <svg-icon :name="data.type" />
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
                <div class="bind-right" v-if="isDelete">
                  <span class="bind-title-left">
                    已选择设备
                  </span>
                  <div class="tree-block">
                    <el-table
                      :data="delDataList"
                      height="400"
                    >
                      <el-table-column
                        prop="label"
                        label="设备名"
                        width="170"                    
                      />
                      <el-table-column
                        prop="path"
                        label="设备路径"
                        width="170"                    
                      />
                    </el-table>
                  </div>
                </div>
              </el-descriptions-item>
              <el-descriptions-item v-if="bindDevice" colon="false">
                <bind-device :current-template="currentTemplate" @on-close="bindDialogClose" />
              </el-descriptions-item>
            </el-descriptions>
          </div>
          <div v-if="createOrUpdateTemplate" class="edit-template">
            <create-or-update-template :createOrUpdateFlag="createOrUpdateFlag" :formData="currentTemplate" :templateId="currentTemplate.templateId" @on-close="createClose" @on-submit="templateSubmit" />
          </div>
        </div>
      </div>
      <el-dialog
        width="30%"
        top="20%"
        :visible="delCertain"
      >
        <i class="el-icon-info" style="color: #faad15;" />
        <span>您确定要删除{{ delNum }}个设备的录制模板吗？</span>
        <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="subDelSubmit">
          确 定
        </el-button>
        <el-button @click="delCertain = false">取 消</el-button>
      </div>
      </el-dialog>
    </el-card>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Ref } from 'vue-property-decorator'
import { getRecordTemplates, queryRecordTemplate, getTemplateDeviceTree, getTemplateNodeDevice, deleteRecordTemplate } from '@/api/template'
import { unbindDeviceRecordTemplateBatch } from '@/api/device'
import BindDevice from '@/views/device/components/dialogs/BindDevice.vue' 
import StatusBadge from '@/components/StatusBadge/index.vue'
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

  @Ref('bindTreeMain') private bindTreeMain

  // 编辑页面参数
  private mainCard = true
  private createOrUpdateTemplate = false
  private createOrUpdateFlag = false

  private isDelete = false
  private delCertain = false
  private handleDevice = true

  private bindDevice = false
  // private unbindDevice = false
  private defaultDevice = true

  private delDataList = []

  private delNum = 0
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

  private bindedDeviceNum = 0
  private bindDialogVisible = false
  private createTemplateDisable = false

  private minHeight = null
  private currentTemplate: any = {}
  private deviceListMain: any = []

  private templates: any = []
  private renderTemplateInfo: any = {}

  private async mounted() {
    // this.handleDevice = true
    this.calMaxHeight()
    this.init()
  }

  // 获取1模板列表并初始化2模板信息和3设备树
  private async init() {
    try {
      // 设置初始化展示页面结构
      this.defaultDevice = true
      this.isDelete = false
      this.bindDevice = false
      this.loading.template = true
      let params = {}
      let res = await getRecordTemplates(params) // 获取模板列表
      console.log('res     ', res)
      this.templates = res.templates
      this.loading.template = false
      this.$nextTick(() => {
        // 默认选中第一个模板
        this.currentTemplate = this.templates[0]
        // 加载第一项的模板信息和设备树
        console.log('1')
        this.initBindDevice()
        this.initTemplateInfo()
      })
    } catch (e) {
      this.$message.error(e)
    }
  }

  // 获取模板信息，查询模板信息
  private async initTemplateInfo() {
    try {
      this.loading.templateInfo = true
      let templateInfo = await queryRecordTemplate({
        templateId: this.currentTemplate.templateId,
      })
      console.log('模板信息     ', templateInfo)
      this.renderTemplateInfo = templateInfo // 渲染模板信息
    } catch (e) {
      this.$message.error(e)
    } finally {
      this.loading.templateInfo = false
    }
  }

  // 获取已绑定设备的设备树
  private async initBindDevice(node?: any) {
    try {
      // 初始化或者重新加载已绑定设备树的时候，关闭删除预览模式
      this.isDelete = false
      this.loading.templateDeviceTree = true
      let templateId = node && node.templateId
      let type = node && node.type
      let path = node && node.path
      let id = node && node.id
      let templateDeviceTree = await getTemplateDeviceTree({
        templateId: templateId || this.currentTemplate.templateId,
        groupId: type === 'group' ? id : 0 ,
        id: id || 0 ,
        type: type,
        path: path,
        bind: true
      })
      console.log('设备树    ', templateDeviceTree)
      this.deviceListMain = templateDeviceTree.dirs // 设备树
      this.bindedDeviceNum = templateDeviceTree.totalSize // 已绑定数目应该直接给出
      // 渲染已绑定设备数
      // this.deviceListMain.map((item: any) => {
        // item.bindStatus === 1 && (this.bindedDeviceNum += 1)
      // })
    } catch (e) {
      this.$message.error(e)
    } finally {
      this.loading.templateDeviceTree = false
    }
  }

  // 选择模板
  private async selectTemplate(template: any) {
    console.log('切换模板')
    // 设置初始化展示页面结构
    this.bindedDeviceNum = 0
    this.mainCard = true
    this.defaultDevice = true
    this.isDelete = false
    this.bindDevice = false
    this.createOrUpdateTemplate = false
    this.createTemplateDisable = false
    // this.handleDevice = true
    this.currentTemplate = template
    console.log('2')
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
    const deviceWrap: any = this.$refs.deviceWrap
    const size = deviceWrap.$el.getBoundingClientRect()
    const top = size.top
    const documentHeight = document.body.offsetHeight
    this.minHeight = documentHeight - top - 22
  }

  // 删除设备
  private delDevice(template: any) {
    // 展示右侧table，展示左侧树可选态
    this.isDelete = true
    this.defaultDevice = true
    this.bindDevice = false
    // this.handleDevice = false
  }
  
  private async loadSubDevice(node: any, resolve: Function) {
    console.log('嗯哼?', node)
    const data: any = node.data
    if (node.data.isLeaf) return resolve([])
    if (node.level === 0) return resolve(this.deviceListMain)
    const rootId = this.getRootId(node)
    try {
      const res = await this.getSubTree(node)
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

  private setNodesChecked(item: any, checked?: boolean) {
    if (checked) {
      // 点击勾选
      this.bindTreeMain.setChecked(item.id, true, true)
    }
  }
  // 已绑定设备勾选状态设置
  private async setChecked(nodes: any, checked?: boolean) {
    console.log('已绑定设备勾选状态设置      ', nodes)
    if (!Array.isArray(nodes)) {
      let item = nodes.data
      this.setNodesChecked(item, checked)
    } else {
    nodes.map((item: any) => {
      this.setNodesChecked(item, checked)
    })
    }
  }

  // 获取子节点
  private async getSubTree(node: any) {
    try{
      const data: any = node.data
      const rootId = this.getRootId(node)
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

  // 删除模板
  private async deleteTemplate(row: any) {
    this.$alertDelete({
      type: '录制模板',
      msg: `确定删除录制模板"${row.templateName}"`,
      method: deleteRecordTemplate,
      payload: { templateId: row.templateId },
      onSuccess: this.init
    })
  }

  // 获取当前节点对应根节点的id
  private getRootId(node: any) {
    while(node.level != 1) {
      return this.getRootId(node.parent)
    }
    return node.data.id
  }


  private async handleCheck(data: any, ischecked: any) {
    // 去展开所有项,一直拿到叶子节点
    await this.deepExpand(data.id, ischecked)
    // console.log('handle   check    ', data, ischecked)
    // this.delDataList = this.bindTreeMain.getCheckedNodes(true, false)
    // console.log('只保留叶子节点', this.delDataList)
    // this.delNum = this.delDataList.length
    // 获取左侧整体勾选状态
    console.log('勾选   删除    ', data, ischecked)
  }

  // 获取已绑定子节点
  private async getSubCheckedTree(node: any) {
    try{
      const data: any = node.data
      const rootId = this.getRootId(node)
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

  // 解绑弹窗确认
  private delSubmit() {
    if (this.delDataList.length === 0) return
    this.delCertain = true
  }

  private async subDelSubmit() {
    try {
      this.loading.unbinding = true
      this.delCertain = false // 关闭dialog
      await unbindDeviceRecordTemplateBatch({
        templateId: this.currentTemplate.templateId,
        devices: this.delDataList
      })
    } catch (e) {
      this.$message.error(e)
    } finally {
      this.loading.unbinding = false
      // 删除完后重新获取绑定设备树
      this.bindedDeviceNum = 0
      this.isDelete = false
      this.defaultDevice = true
      // this.handleDevice = true
      this.initBindDevice()
    }
  }
  
  // 递归展开当前节点的所有已绑定子节点
  private async deepExpand(id: any, checked: any) {
    const dirTreeNode = this.bindTreeMain && this.bindTreeMain.getNode(id)
    const dirs = dirTreeNode && await this.getSubCheckedTree(dirTreeNode)
    // 叶子节点处理
    if (!dirs || dirs.length === 0) {
      dirTreeNode && (dirTreeNode.loaded = true)
      return
    }
    this.bindTreeMain.updateKeyChildren(id, dirs)
    dirTreeNode && (dirTreeNode.loaded = true)
    // this.previewTree.updateKeyChildren(id, dirs)
    // const previewTreeNode = this.previewTree.getNode(id)
    // previewTreeNode.loaded = true
    dirs.forEach(async dir => {
      // 半选如何处理
      // const leftNode = this.bindTreeMain.getNode(dir.id)
      // this.setChecked(leftNode, checked)
      
      if (!dir.isLeaf) {
        await this.deepExpand(dir.id, checked)
      }
    })
  }

  // 点击'绑定设备'按钮
  private clickBind() {
    this.bindDevice = true
    this.isDelete = false
    this.defaultDevice = false
    // this.handleDevice = false
  }

  // 点击'删除设备'按钮
  private clickUnbind() {
    this.isDelete = true
    this.defaultDevice = true
    // this.handleDevice = false
    this.bindDevice = false
  }

  // 取消删除设备
  private handleUnbindCancel() {
    this.isDelete = false
    this.defaultDevice = true
    // this.handleDevice = true
  }
  
  // 关闭绑定 或 取消绑定设备
  private async bindDialogClose(isBinded: boolean) {
    console.log('关闭绑定    ', isBinded)
    this.bindDevice = false
    // 切换回默认页面
    this.defaultDevice = true
    // this.handleDevice = true
    if (isBinded) {
      // 绑定设备,重新请求设备树
      console.log('3')
      this.bindedDeviceNum = 0
      this.initBindDevice()
    }
    console.log('关闭绑定    查看    树   ', this.deviceListMain)
  }

  // 新建模板
  private createTemplate() {
    // 关闭主页面
    // 展示新建/编辑页面
    this.mainCard = false
    this.createTemplateDisable = true
    this.createOrUpdateTemplate = true
    this.createOrUpdateFlag = true // 新建
  }

  // 编辑模板
  private editTemplate(template: any) {
    console.log('点击编辑', template)
    this.currentTemplate = template
    this.mainCard = false
    this.createTemplateDisable = true
    this.createOrUpdateTemplate = true
    this.createOrUpdateFlag = false // 编辑
  }

  // 关闭新建/编辑模板
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

  // 提交模板编辑/新建操作
  private templateSubmit(finish: boolean) {
    // 禁止操作模板列表
    if (!finish) {
      this.loading.template = true
    }
    if (finish) {
      this.loading.template = false
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
.bind-right {
  float: right;
  margin-left: 20px;
  width: 340px;
  height: 400px;
}

.bind-left {
  display: inline-block;
  width: 340px;
  height: 400px;
}

.tree-block {
  border: 1px $borderGrey solid;
  width: 340px;
  overflow: hidden;
  height: 400px;
}

.template-list {
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

</style>
