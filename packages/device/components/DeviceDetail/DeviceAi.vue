<template>
  <div class="app-detail">
    <div v-if="!noapp">
      <div class="select">
        应用名称：
        <el-select v-model="app" placeholder="请选择" @change="appChange">
          <!-- <el-option key="all" value="all" label="全部" /> -->
          <el-option
            v-for="item in apps"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </div>
      <!-- <el-radio-group v-model="app" @change="appChange">
        <el-radio-button v-for="(item, index) in apps" :key="item.id" :label="item.id">{{ apps[index].name }}</el-radio-button>
      </el-radio-group> -->
      <app-sub-detail v-if="appInfo.name" :device="deviceProp" :app-info="appInfo" :face-lib="faceLib" />
    </div>
    <div v-else class="no-data">暂无绑定的应用</div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import AppSubDetail from '@vss/ai/component/AppSubDetail.vue'
import { getAppList } from '@vss/device/api/ai-app'
import detailMixin from '@vss/device/mixin/deviceMixin'

@Component({
  name: 'DetailAi',
  components: {
    AppSubDetail
  }
})
export default class extends Mixins(detailMixin) {
  @Prop() private describeIboxApps!: Function
  private appInfo: any = {}
  private apps: any = []
  private app: any = ''
  private faceLib: any = {}
  private appselected: String = ''
  private deviceProp: any

  public get noapp() {
    return this.apps.length === 0
  }

  private async mounted() {
    try {
      await this.getDevice()
      this.isIbox ? this.initIboxApp() : this.initDeviceApp()
      // const { groups }: any = await getAIConfigGroupData({})
      // this.initFaceLib(groups)
    } catch (e) {
      console.log(e)
    }
  }

  private async initIboxApp() {
    const path: any = this.$route.query.path
    const iboxId = path.split(',')[0]
    const { iboxApps }: any = await this.describeIboxApps({
      pageSize: 1000,
      iboxId,
      deviceId: this.deviceId
    })
    const transformIboxAppInfo = (iboxApps) => {
      const transformed = iboxApps.map(app => ({
        ...app,
        id: app.appId,
        algorithm: {
          code: app?.algorithmsId
        }
      }))
      return transformed
    }
    const transIboxApps = transformIboxAppInfo(iboxApps)
    this.deviceProp = { deviceId: this.deviceId, inProtocol: this.inProtocol }
    if (transIboxApps.length > 0) {
      this.appInfo = transIboxApps[0]
      this.apps = transIboxApps
      this.app = this.appInfo.appId
    }
  }

  private async initDeviceApp() {
    const { aiApps } = await getAppList({ deviceId: this.deviceId })
    if (aiApps.length > 0) {
      this.deviceProp = { deviceId: this.deviceId, inProtocol: this.inProtocol }
      this.appInfo = aiApps[0]
      this.apps = aiApps
      this.app = this.appInfo.id
    }
  }

  private initFaceLib(groups) {
    if (this.appInfo.algorithmMetadata?.length > 0) {
      const algorithmMetadata = JSON.parse(this.appInfo.algorithmMetadata)
      if (algorithmMetadata.FaceDbName) {
        this.faceLib = groups.filter(item => item.id === algorithmMetadata.FaceDbName)[0]
      }
    }
  }

  private appChange(val) {
    const temp = this.apps.filter(item => item.id === val)
    if (temp.length > 0) {
      this.appInfo = temp[0]
    }
  }
}
</script>
<style lang="scss" scoped>
.app-detail {
  min-width: 1500px;
  overflow: auto;
}

.select {
  float: left;
  padding: 6px 20px 0 0;

  .el-select {
    width: 120px;

    ::v-deep .el-input {
      padding-top: 2px;
    }
  }
}

.no-data {
  height: 400px;
  line-height: 200px;
  vertical-align: middle;
  text-align: center;
  color: rgba(186, 198, 198);
}
</style>
