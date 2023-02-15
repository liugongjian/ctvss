<template>
  <div class="app-container">
    <el-card ref="deviceWrap" class="device-list-wrap">
      <div class="device-list" :style="{height: `${maxHeight}px`}" :class="{'device-list--dragging': dirDrag.isDragging}">
        <div
          class="device-list__handle"
          :style="`left: ${dirDrag.width}px`"
          @mousedown="changeWidthStart($event)"
        />
        <div class="device-list__left" :style="`width: ${dirDrag.width}px`">
          <div class="dir-list__tools">
            <span class="left-title">模板列表</span>
            <el-tooltip class="item new-template" effect="dark" content="新建录制模板" placement="top" :open-delay="300">
              <el-button>+ 新建</el-button>
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
          <el-descriptions :column="2" border v-loading="loading.templateInfo">
            <template slot="title">
              <span class="title">模板信息</span>
            </template>
            <template slot="extra">
              <el-button type="text" class="btn-edit">编辑</el-button>
            </template>
            <el-descriptions-item label="模板名称">{{ renderTemplateInfo.templateName }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ renderTemplateInfo.createdTime }}</el-descriptions-item>
            <el-descriptions-item label="存储时长">{{ renderTemplateInfo.storageTime }}</el-descriptions-item>
            <el-descriptions-item label="周期时长">{{ renderTemplateInfo.interval }}</el-descriptions-item>
            <el-descriptions-item label="录制类别">{{ renderTemplateInfo.recordType }}</el-descriptions-item>
            <el-descriptions-item label="备注">{{ renderTemplateInfo.description }}</el-descriptions-item>
          </el-descriptions>
          <el-descriptions labelClassName="has-no-colon" :column="1">
            <template slot="title">
              <span class="title">绑定关系</span>
            </template>
            <el-descriptions-item colon="false">
              <el-button type="primary"  @click="bindDialogVisible = true">+ 绑定设备</el-button>
              <el-button @click="delDevice">删除设备</el-button>
            </el-descriptions-item>
            <el-descriptions-item colon="false">
              <div>
                <span class="bind-title-left">
                  已绑定设备
                </span>
                <span class="bind-title-right">
                  已绑定 {{ bindedDeviceNum }} 项
                </span>
                <div class="tree-block">
                  <el-tree
                    ref="bindTree"
                    :data="deviceList"
                    node-key="id"
                    lazy
                    v-loading="loading.templateDeviceTree"
                    highlight-current
                    empty-text="暂无已绑定设备"
                    :load="loadSubDevice"
                  >
                  </el-tree>
                </div>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      <bind-device :current-template="currentTemplate" v-if="bindDialogVisible" @on-close="bindDialogClose" />
    </el-card>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Mixins, Provide } from 'vue-property-decorator'
import { getRecordTemplates, queryRecordTemplate, getTemplateDeviceTree, getTemplateNodeDevice } from '@/api/template'
import BindDevice from '@/views/device/components/dialogs/BindDevice.vue' 

@Component({
  name: 'CustomDeviceTree',
  components: {
    BindDevice
  }
})
export default class extends Vue {

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
    templateDeviceTree: false
  }

  private bindedDeviceNum = 0
  private bindDialogVisible = false

  private maxHeight = null
  private currentTemplate: any = {}
  private deviceList: any = []

  private templates: any = []
  private renderTemplateInfo: any = {}

  private async mounted() {
    this.init()
  }

  // 获取1模板列表并初始化2模板信息和3设备树
  private async init() {
    try {
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
      this.deviceList = templateDeviceTree.dirs // 设备树
      this.bindedDeviceNum = templateDeviceTree.totalSize // 已绑定数目应该直接给出
      // 渲染已绑定设备数
      // this.deviceList.map((item: any) => {
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
    this.currentTemplate = template
    console.log('2')
    this.initBindDevice()
    this.initTemplateInfo()
  }

  /**
   * 编辑模板
   */
  private editTemplate(template: any) {
    this.$router.push({
      path: '/custom-device-tree/template-update',
      query: {
        templateId: template.platformId
      }
    })
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
    this.maxHeight = documentHeight - top - 22
  }

  // 绑定设备
  private bindDevice(template: any) {
    console.log('绑定设备    ', template)
  }

  // 删除设备
  private delDevice(template: any) {
    console.log('删除设备', template)
  }
  
  private async loadSubDevice(node: any, resolve: Function) {
    const data: any = node.data
    if (node.level === 0 || node.data.isLeaf) return resolve([])
    try {
      // 获取设备子节点数据
      const res = await getTemplateDeviceTree({
        templateId: this.currentTemplate.templateId,
        groupId: data.type === 'group' ? data.id : 0,
        id: data.id,
        type: data.type,
        bind: true,
        path: data.path
      })
      return resolve(res.dirs)
    } catch (e) {
      resolve([])
    }
  }

  // 关闭绑定dialog
  private async bindDialogClose(isBinded: boolean) {
    console.log('关闭绑定对话框    ', isBinded)
    if (isBinded) {
      // 绑定设备,重新请求设备树
      console.log('3')
      this.initBindDevice()
    }
    this.bindDialogVisible = false
  }
}
</script>
<style lang="scss">
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

</style>
