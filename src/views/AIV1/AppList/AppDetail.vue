<template>
  <div class="app-container">
    <el-alert
      title="数据与设备绑定，如查询，需优先选择设备"
      type="info"
      show-icon
      :closable="false"
      class="mb10"
    />
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-tabs v-model="tabNum" type="border-card" @tab-click="handleTabClick">
      <el-tab-pane label="基本信息" :name="'0'">
        <BasicAppInfo
          v-if="appInfo.name"
          :app-info="appInfo"
          :face-lib="faceLib"
        />
      </el-tab-pane>
      <el-tab-pane label="关联设备" :name="'1'">
        <AttachedDevice v-if="tabNum === '1'" />
      </el-tab-pane>
      <el-tab-pane label="分析结果" :name="'2'">
        <div v-if="tabNum==='2'" class="app-container__result">
          <!-- <div
            class="device-list__handle"
            :style="`left: ${dirDrag.width}px`"
            @mousedown="changeWidthStartAndResize($event)"
          />
          <div ref="dirList" class="left" :style="`width: ${dirDrag.width}px`">
            <el-tree
              ref="dirTree"
              node-key="id"
              lazy
              :data="dirList"
              :load="loadDirs"
              :props="treeProp"
              :check-strictly="false"
              @node-click="selectDevice"
            >
              <span slot-scope="{node, data}" class="custom-tree-node" :class="`custom-tree-node__${data.type}`">
                <span class="node-name" :class="data.deviceStatus === 'on' ? 'online': 'offline'">
                  <svg-icon :name="data.type" />
                  {{ node.label }}
                </span>
              </span>
            </el-tree>
          </div> -->
          <div class="app-container__result__device">
            <span>设备名称:</span>
            <el-select
              v-model="device"
              placeholder="请选择"
              value-key="deviceId"
            >
              <el-option
                v-for="value in deviceList"
                :key="value.deviceId"
                :label="
                  value.deviceType === 'nvr'
                    ? `NVR / ${value.deviceName}`
                    : value.deviceName
                "
                :value="value"
              />
            </el-select>
          </div>
          <!-- <div class="right" :style="`width: calc(100% - ${dirDrag.width}px)`"> -->
          <div class="right">
            <AppSubDetail
              v-if="appInfo.name"
              :device="device"
              :app-info="appInfo"
              :face-lib="faceLib"
            />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script lang="ts">
import { getAppInfo, getAttachedDevice } from '@/api/ai-app'
// import { getAIConfigGroupData } from '@/api/aiConfig'
import { getDeviceTree } from '@/api/device'
import { getGroups } from '@/api/group'
import { listGroup } from '@/api/face'
import IndexMixin from '@/views/device/mixin/indexMixin'
import { Component, Mixins } from 'vue-property-decorator'
import AppMixin from '../mixin/app-mixin'
import AppSubDetail from './component/AppSubDetail.vue'
import AttachedDevice from './component/AttachedDevice.vue'
import BasicAppInfo from './component/BasicAppInfo.vue'
import { CostumColors, HelmetClothType, CityGovType, TrashType, AnimalType } from '@/dics'

@Component({
  name: 'AppDetail',
  components: {
    BasicAppInfo,
    AppSubDetail,
    AttachedDevice
  }
})
export default class extends Mixins(AppMixin, IndexMixin) {
  // private treeProp = {
  //   label: 'label',
  //   children: 'children',
  //   isLeaf: 'isLeaf'
  // }
  // private dirList: any = []
  private breadCrumbContent: String = '应用详情'
  private appInfo: any = {}
  private device: any = {
    deviceId: '',
    inProtocol: ''
  }
  private faceLib: any = {}
  private tabNum: string | string[] = ''
  private deviceList: any = []

  /**
   * 生成检测项数据
   */
  public formatData(app) {
    const algorithmMetadata = JSON.parse(app.algorithmMetadata)
    switch (app.algorithmsId) {
      // 工作服检测
      case '35': case '10035':
        if (algorithmMetadata.clothesDetectItems?.length) {
          app.detectItemNames = algorithmMetadata.clothesDetectItems.map((item) => {
            const itemArr = item.split('_')
            const styleType = itemArr[0]
            const styleName = itemArr[1]
            return CostumColors[styleType][styleName]
          }).join('；')
        } else {
          app.detectItemNames = Object.values(CostumColors['2']).join('；')
        }
        break
      // 安全帽反光服
      case '4': case '10007':
        if (algorithmMetadata.helmetReflectiveType?.length) {
          app.detectItemNames = algorithmMetadata.helmetReflectiveType.map((item) => {
            const findItem = HelmetClothType.find((innerItem) => innerItem.label === item)
            return findItem ? findItem.cname : ''
          }).join('；')
        }
        break
      // 城市治理
      case '37': case '10037':
        if (!this.isIndustrialDetection && algorithmMetadata.cityGovType?.length) {
          app.detectItemNames = algorithmMetadata.cityGovType.map((item) => {
            const findItem = CityGovType.find((innerItem) => innerItem.label === item)
            return findItem ? findItem.cname : ''
          }).join('；')
        }
        break
      // 垃圾站检测
      case '29': case '10026':
        if (algorithmMetadata.trashRecycleType?.length) {
          app.detectItemNames = algorithmMetadata.trashRecycleType.map((item) => {
            const findItem = TrashType.find((innerItem) => innerItem.label === item)
            return findItem ? findItem.cname : ''
          }).join('；')
        }
        break
      // 动物检测
      case '33': case '10033':
        if (algorithmMetadata.animalDetectType?.length) {
          app.detectItemNames = algorithmMetadata.animalDetectType.map((item) => {
            const findItem = AnimalType.find((innerItem) => innerItem.label === item)
            return findItem ? findItem.cname : ''
          }).join('；')
        }
        break
    }

    return app
  }

  private async mounted() {
    this.tabNum = this.$route.query.tabNum
    this.appInfo = await getAppInfo({ id: this.$route.query.appid })
    // this.appInfo = this.formatData(this.appInfo)
    this.initDirs()
    const { groups } = await listGroup({
      pageNum: 0,
      pageSize: 3000
    })
    this.initFaceLib(groups)
    const { deviceList } = await getAttachedDevice({
      appId: this.$route.query.appid,
      pageSize: 3000
    })
    this.deviceList = deviceList
    deviceList.length > 0 && (this.device = deviceList[0])
  }

  private initFaceLib(groups) {
    const algorithmMetadata = JSON.parse(this.appInfo.algorithmMetadata)
    if (algorithmMetadata.FaceDbName) {
      this.faceLib = groups.filter(item => (item.id + '') === algorithmMetadata.FaceDbName)[0]
    }
  }

  public changeWidthStartAndResize(ev) {
    this.changeWidthStart(ev)
    // 改变宽度后触发一次resize事件，调整chart
    const e = document.createEvent('Event')
    e.initEvent('resize', true, true)
    window.dispatchEvent(e)
  }

  /**
     * 初始化设备列表
     */
  public async initDirs() {
    try {
      this.loading.dir = true
      const res = await getGroups({
        pageSize: 1000
      })
      this.dirList = []
      res.groups.forEach((group: any) => {
        (group.inProtocol === 'gb28181' || group.inProtocol === 'ehome' || group.inProtocol === 'vgroup') && (
          this.dirList.push({
            id: group.groupId,
            groupId: group.groupId,
            label: group.groupName,
            inProtocol: group.inProtocol,
            type: group.inProtocol === 'vgroup' ? 'vgroup' : 'top-group',
            disabled: true,
            path: [{
              id: group.groupId,
              label: group.groupName,
              type: group.inProtocol === 'vgroup' ? 'vgroup' : 'top-group'
            }],
            deviceStatus: group.deviceStatus
          })
        )
      })
    } catch (e) {
      this.dirList = []
    } finally {
      this.loading.dir = false
    }
  }

  /**
     * 展开设备列表时Load子树
     */
  public async loadDirs(node: any, resolve: Function) {
    if (node.level === 0) return resolve([])
    const dirs = await this.getTree(node)
    resolve(dirs)
  }

  /**
     * 获取设备列表时Load子树数据
     */
  private async getTree(node: any) {
    try {
      if (node.data.type === 'role') {
        node.data.roleId = node.data.id
      } else if (node.data.type === 'group') {
        node.data.realGroupId = node.data.id
        node.data.realGroupInProtocol = node.data.inProtocol
      }
      const devices: any = await getDeviceTree({
        groupId: node.data.groupId,
        id: node.data.type === 'top-group' || node.data.type === 'vgroup' ? 0 : node.data.id,
        inProtocol: node.data.inProtocol,
        type: node.data.type === 'top-group' || node.data.type === 'vgroup' ? undefined : node.data.type,
        'self-defined-headers': {
          'role-id': node.data.roleId,
          'real-group-id': node.data.realGroupId
        }
      })
      if (node.data.type === 'role') {
        devices.dirs = devices.dirs.filter((dir: any) => dir.inProtocol === 'gb28181' || dir.inProtocol === 'ehome')
      }
      const dirs: any = devices.dirs.map((dir: any) => {
        const sharedFlag = false
        return {
          id: dir.id,
          groupId: node.data.groupId,
          label: dir.label,
          inProtocol: dir.inProtocol || node.data.inProtocol,
          isLeaf: dir.isLeaf,
          type: dir.type,
          disabled: dir.type !== 'ipc' || sharedFlag,
          path: node.data.path.concat([dir]),
          sharedFlag: sharedFlag,
          roleId: node.data.roleId || '',
          realGroupId: node.data.realGroupId || '',
          realGroupInProtocol: node.data.realGroupInProtocol || '',
          deviceStatus: dir.deviceStatus || ''
        }
      })
      return dirs
    } catch (e) {
      console.log(e)
    }
  }

  /**
     * 获取设备列表时Load子树数据
     */
  private selectDevice(data: any) {
    data.isLeaf && (this.device = { deviceId: data.id, inProtocol: data.inProtocol })
    const dirTree: any = this.$refs.dirTree
    dirTree.setCurrentKey(data.id)
  }
  private handleTabClick() {
    // resize 为了让图表触发刷新从而自适应尺寸
    const e = document.createEvent('Event')
    e.initEvent('resize', true, true)
    window.dispatchEvent(e)
    this.appDetail({ id: this.$route.query.appid }, this.tabNum)
  }

  private back() {
    this.$router.push({ name: 'AIAppList' })
  }
}
</script>

<style lang='scss' scoped>
.el-tab-pane {
  display: flex;
}

.app-container__result {
  position: relative;
  width: 100%;

  &__device {
    float: left;
    padding: 0 20px;
    line-height: 50px;

    & > span {
      margin-right: 10px;
    }

    .el-select {
      max-width: 120px;
    }
  }

  .left {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    overflow: auto;

    .el-tree {
      min-width: 100%;
      display: inline-block !important;

      ::v-deep .el-tree-node > .el-tree-node__children {
        overflow: visible;
      }
    }

    .is-disabled + .custom-tree-node__ipc {
      cursor: not-allowed;
    }
  }

  .right {
    padding-left: 20px;
    // display: inline-block;
    // border-left: 1px solid $borderGrey;
  }
}

.online {
  .svg-icon {
    color: #65c465;
  }
}

.offline {
  .svg-icon {
    color: #6e7c89;
  }
}

.no-data {
  height: 200px;
  line-height: 200px;
  vertical-align: middle;
  text-align: center;
  color: rgba(186, 198, 198);
}
</style>
