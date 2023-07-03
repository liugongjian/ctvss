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
import { listGroup } from '@/api/face'
import IndexMixin from '@/views/device/mixin/indexMixin'
import { Component, Mixins } from 'vue-property-decorator'
import AppMixin from '../mixin/app-mixin'
import AppSubDetail from '@vss/ai/component/AppSubDetail.vue'
import AttachedDevice from '@vss/ai/component/AttachedDevice.vue'
import BasicAppInfo from './component/BasicAppInfo.vue'
@Component({
  name: 'AppDetail',
  components: {
    BasicAppInfo,
    AppSubDetail,
    AttachedDevice
  }
})
export default class extends Mixins(AppMixin, IndexMixin) {
  private breadCrumbContent: String = '应用详情'
  private appInfo: any = {}
  private device: any = {
    deviceId: '',
    inProtocol: ''
  }
  private faceLib: any = {}
  private tabNum: string | string[] = ''
  private deviceList: any = []

  private async mounted() {
    try {
      console.log('app-detail')
      this.tabNum = this.$route.query.tabNum
      this.appInfo = await getAppInfo({ id: this.$route.query.appid })
      const { deviceList } = await getAttachedDevice({
        appId: this.$route.query.appid,
        pageSize: 3000
      })
      this.deviceList = deviceList
      deviceList.length > 0 && (this.device = deviceList[0])
      const { data } = await listGroup({
        pageNum: 0,
        pageSize: 3000
      })
      this.initFaceLib(data)
    } catch (e){
      console.log(e)
    }

  }

  private initFaceLib(groups) {
    const algorithmMetadata = JSON.parse(this.appInfo.algorithmMetadata)
    if (algorithmMetadata.FaceDbName) {
      this.faceLib = groups.filter(
        (item) => item.id + '' === algorithmMetadata.FaceDbName
      )[0]
    }
  }

  public changeWidthStartAndResize(ev) {
    this.changeWidthStart(ev)
    // 改变宽度后触发一次resize事件，调整chart
    const e = document.createEvent('Event')
    e.initEvent('resize', true, true)
    window.dispatchEvent(e)
  }

  private handleTabClick() {
    // resize 为了让图表触发刷新从而自适应尺寸
    const e = document.createEvent('Event')
    e.initEvent('resize', true, true)
    window.dispatchEvent(e)
    this.appDetail({ id: this.$route.query.appid }, this.tabNum)
  }

  private back() {
    this.$router.push({ path: '/ai/ai-app-list' })
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
