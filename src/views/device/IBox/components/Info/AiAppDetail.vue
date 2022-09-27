<template>
  <div class="app-container">
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
        <AtachedDevice v-if="tabNum==='1'" :app-info="appInfo" />
      </el-tab-pane>
      <el-tab-pane label="分析结果" :name="'2'">
        <div class="app-container__result">
          <div class="app-container__result__device">
            <span>设备:</span>
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
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BasicAppInfo from '@/views/AI/AppList/component/BasicAppInfo.vue'
import AppSubDetail from '@/views/AI/AppList/component/AppSubDetail.vue'
import AtachedDevice from './AtachedDevice.vue'
import { getAttachedDevice } from '@/api/ai-app'

import { describeIboxApp } from '@/api/ibox'
// import { getDeviceTree } from '@/api/device'
// import { getGroups } from '@/api/group'
import AppMixin from '@/views/AI/mixin/app-mixin'
import IndexMixin from '@/views/device/mixin/indexMixin'
@Component({
  name: 'AppDetail',
  components: {
    BasicAppInfo,
    AppSubDetail,
    AtachedDevice
  }
})
export default class extends Mixins(AppMixin, IndexMixin) {
  @Prop({}) public appDetailId!: any
  private breadCrumbContent: String = '应用详情'
  private appInfo: any = {}
  private device: any = {
    deviceId: '',
    inProtocol: ''
  }
  private faceLib: any = {}
  private tabNum: string | string[] = '0'
  private deviceList: any = []

  private async mounted() {
    const appId = this.$route.query.appid || this.appDetailId

    const { iboxApp }: any = await describeIboxApp({
      appId,
      iboxId: this.$route.query.deviceId
    })
    this.appInfo = iboxApp
    const { deviceList } = await getAttachedDevice({
      appId,
      pageSize: 3000
    })
    this.deviceList = deviceList
    deviceList.length > 0 && (this.device = deviceList[0])
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
  // public async initDirs() {
  //   try {
  //     this.loading.dir = true
  //     const res = await getGroups({
  //       pageSize: 1000
  //     })
  //     this.dirList = []
  //     res.groups.forEach((group: any) => {
  //       (group.inProtocol === 'gb28181' || group.inProtocol === 'ehome' || group.inProtocol === 'vgroup') && (
  //         this.dirList.push({
  //           id: group.groupId,
  //           groupId: group.groupId,
  //           label: group.groupName,
  //           inProtocol: group.inProtocol,
  //           type: group.inProtocol === 'vgroup' ? 'vgroup' : 'top-group',
  //           disabled: true,
  //           path: [{
  //             id: group.groupId,
  //             label: group.groupName,
  //             type: group.inProtocol === 'vgroup' ? 'vgroup' : 'top-group'
  //           }],
  //           deviceStatus: group.deviceStatus
  //         })
  //       )
  //     })
  //   } catch (e) {
  //     this.dirList = []
  //   } finally {
  //     this.loading.dir = false
  //   }
  // }

  /**
   * 展开设备列表时Load子树
   */
  // public async loadDirs(node: any, resolve: Function) {
  //   if (node.level === 0) return resolve([])
  //   const dirs = await this.getTree(node)
  //   resolve(dirs)
  // }

  /**
   * 获取设备列表时Load子树数据
   */
  // private async getTree(node: any) {
  //   try {
  //     if (node.data.type === 'role') {
  //       node.data.roleId = node.data.id
  //     } else if (node.data.type === 'group') {
  //       node.data.realGroupId = node.data.id
  //       node.data.realGroupInProtocol = node.data.inProtocol
  //     }
  //     const devices: any = await getDeviceTree({
  //       groupId: node.data.groupId,
  //       id: node.data.type === 'top-group' || node.data.type === 'vgroup' ? 0 : node.data.id,
  //       inProtocol: node.data.inProtocol,
  //       type: node.data.type === 'top-group' || node.data.type === 'vgroup' ? undefined : node.data.type,
  //       'self-defined-headers': {
  //         'role-id': node.data.roleId,
  //         'real-group-id': node.data.realGroupId
  //       }
  //     })
  //     if (node.data.type === 'role') {
  //       devices.dirs = devices.dirs.filter((dir: any) => dir.inProtocol === 'gb28181' || dir.inProtocol === 'ehome')
  //     }
  //     let dirs: any = devices.dirs.map((dir: any) => {
  //       let sharedFlag = false
  //       return {
  //         id: dir.id,
  //         groupId: node.data.groupId,
  //         label: dir.label,
  //         inProtocol: dir.inProtocol || node.data.inProtocol,
  //         isLeaf: dir.isLeaf,
  //         type: dir.type,
  //         disabled: dir.type !== 'ipc' || sharedFlag,
  //         path: node.data.path.concat([dir]),
  //         sharedFlag: sharedFlag,
  //         roleId: node.data.roleId || '',
  //         realGroupId: node.data.realGroupId || '',
  //         realGroupInProtocol: node.data.realGroupInProtocol || '',
  //         deviceStatus: dir.deviceStatus || ''
  //       }
  //     })
  //     return dirs
  //   } catch (e) {
  //     console.log(e)
  //   }
  // }

  /**
   * 获取设备列表时Load子树数据
   */
  // private selectDevice(data: any) {
  //   data.isLeaf && (this.device = { deviceId: data.id, inProtocol: data.inProtocol })
  //   const dirTree: any = this.$refs.dirTree
  //   dirTree.setCurrentKey(data.id)
  // }

  private handleTabClick() {
    // resize 为了让图表触发刷新从而自适应尺寸
    const e = document.createEvent('Event')
    e.initEvent('resize', true, true)
    window.dispatchEvent(e)
  }

  private back() {
    this.$emit('back')
  }
}
</script>

<style lang="scss" scoped>
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
