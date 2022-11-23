<template>
  <div class="device-ai">
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
      <app-sub-detail v-if="appInfo.name" :device="device" :app-info="appInfo" :face-lib="faceLib" />
    </div>
    <div v-else class="no-data">暂无绑定的应用</div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import AppSubDetail from '@/views/AI/AppList/component/AppSubDetail.vue'
import { getAppList } from '@/api/ai-app'
import { describeIboxApps } from '@/api/ibox'
// import { getAIConfigGroupData } from '@/api/aiConfig'
import detailMixin from '@vss/device/mixin/deviceMixin'

@Component({
  name: 'DetailAi',
  components: {
    AppSubDetail
  }
})
export default class extends Mixins(detailMixin) {
  @Prop() public deviceId!: any
  @Prop() public inProtocol!: any
  private appInfo: any = {}
  private apps: any = []
  private app: any = ''
  private faceLib: any = {}
  private appselected: String = ''
  public device!: any

  public allAppOption = {
    appId: 'all',
    algorithm: {
      code: '20001'
    }
  }

  public get noapp() {
    return this.apps.length === 0
  }

  public get isIbox() {
    return this.$route.path.includes('ibox')
  }

  private async mounted() {
    try {
      this.isIbox ? this.initIboxApp() : this.initDeviceApp()
      // const { groups }: any = await getAIConfigGroupData({})
      // this.initFaceLib(groups)
    } catch (e) {
      console.log(e)
    }
  }

  private async initIboxApp() {
    const { deviceId }: any = this.$route.query
    const path: any = this.$route.query.path
    const iboxId = path.split(',')[0]
    const { iboxApps }: any = await describeIboxApps({
      pageSize: 1000,
      iboxId,
      deviceId
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
    this.device = { deviceId, inProtocol: this.inProtocol }
    if (transIboxApps.length > 0) {
      this.appInfo = transIboxApps[0]
      this.apps = transIboxApps
      this.app = this.appInfo.appId
    }
  }

  private async initDeviceApp() {
    const { aiApps } = await getAppList({ deviceId: this.deviceId })
    if (aiApps.length > 0) {
      this.device = { deviceId: this.deviceId, inProtocol: this.inProtocol }
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
// .el-radio-group{
//   margin-bottom: 20px;
//   ::v-deep .el-radio-button__inner {
//     display: inline-block;
//     min-width: 160px;
//   }
// }
.device-ai {
  min-width: 1100px;
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
