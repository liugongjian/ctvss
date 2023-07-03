<template>
  <div>
    <div v-if="!noapp">
      <div class="select">
        应用名称：
        <el-select v-model="app" placeholder="请选择" @change="appChange">
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
import { Component, Vue, Prop } from 'vue-property-decorator'
import AppSubDetail from '@/views/AIV1/AppList/component/AppSubDetail.vue'
import { getAppList } from '@/api/ai-app'
// import { getAIConfigGroupData } from '@/api/aiConfig'

@Component({
  name: 'DetailAi',
  components: {
    AppSubDetail
  }
})
export default class extends Vue {
  @Prop() private deviceId!: any
  @Prop() private inProtocol!: any
  private appInfo: any = {}
  private apps: any = []
  private app: any = ''
  private faceLib: any = {}
  private appselected: String = ''
  private get device() {
    return { deviceId: this.deviceId, inProtocol: this.inProtocol }
  }
  private get noapp() {
    return this.apps.length === 0
  }

  private async mounted() {
    try {
      this.initDeviceApp()
      // const { groups }: any = await getAIConfigGroupData({})
      // this.initFaceLib(groups)
    } catch (e) {
      console.log(e)
    }
  }

  private async initDeviceApp() {
    const { aiApps } = await getAppList({ deviceId: this.$route.query.deviceId })
    if (aiApps.length > 0) {
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
