<template>
  <div>
    <el-radio-group v-model="app" @change="appChange">
      <el-radio-button v-for="item in apps" :key="item.id" :label="item.name" :name="item.id" />
    </el-radio-group>
    <app-sub-detail v-if="appInfo.name" :device="device" :app-info="appInfo" :face-lib="faceLib" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import AppSubDetail from '@/views/AI/applist/component/AppSubDetail.vue'
// import { getAppInfo } from '@/api/ai-app'
import { getAIConfigGroupData } from '@/api/aiConfig'

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

  private async mounted() {
    // this.apps = await getAppInfo({ id: this.$route.query.appid })
    this.initDeviceApp()
    const { groups }: any = await getAIConfigGroupData({})
    this.initFaceLib(groups)
  }

  private initDeviceApp() {
    // this.apps = await getAppInfo({ id: this.$route.query.appid })
    this.apps = [{ id: '13', name: '人脸', description: 'dsf', analyseType: 'AI-100', effectiveTime: '[{"starttime":"00:00:00","endtime":"23:59:59"}]', confidence: 0, callbackUrl: 'sdf', callbackKey: '', appEnabled: '1', deleted: 'N', userId: '20720016', iamGroupId: '0', admUserId: '0', createTime: '2021-09-13 14:19:09', updateTime: '2021-09-14 19:26:47', joinDeviceNum: '0', user: '', mainUserId: '', innerIamUserId: '', algorithmsId: '0', associateDevices: '0', algorithm: { id: '1', name: '人脸识别', summary: '通过比对人脸库中的照片，进行1:N比对，得到人脸相似度，分析图片中人脸的遮挡度、模糊度、光照强度、姿态角度、完整度，基于输出的符合质量标准的图片，返回被识别的人员信息。', code: '10001', icon: '人脸识别', type: '', publishFlag: '人脸识别', detail: '人脸识别', labels: '人脸识别', needConfig: '1', aiAbility: null, createTime: '2021-03-30 10:46:53', updateTime: '2021-03-30 10:46:53', aiAbilityId: '1' }, algorithmMetadata: '{"FaceDbName":"163263019880431616"}', abilityId: '0' },
      { id: '14', name: '脸', description: 'dsf', analyseType: 'AI-100', effectiveTime: '[{"starttime":"00:00:00","endtime":"23:59:59"}]', confidence: 0, callbackUrl: 'sdf', callbackKey: '', appEnabled: '1', deleted: 'N', userId: '20720016', iamGroupId: '0', admUserId: '0', createTime: '2021-09-13 14:19:09', updateTime: '2021-09-14 19:26:47', joinDeviceNum: '0', user: '', mainUserId: '', innerIamUserId: '', algorithmsId: '0', associateDevices: '0', algorithm: { id: '1', name: '人脸识别', summary: '通过比对人脸库中的照片，进行1:N比对，得到人脸相似度，分析图片中人脸的遮挡度、模糊度、光照强度、姿态角度、完整度，基于输出的符合质量标准的图片，返回被识别的人员信息。', code: '10001', icon: '人脸识别', type: '', publishFlag: '人脸识别', detail: '人脸识别', labels: '人脸识别', needConfig: '1', aiAbility: null, createTime: '2021-03-30 10:46:53', updateTime: '2021-03-30 10:46:53', aiAbilityId: '1' }, algorithmMetadata: '{"FaceDbName":"163263019880431616"}', abilityId: '0' }]
    this.apps.length > 0 && (this.appInfo = this.apps[0])
    this.app = this.appInfo.name
  }

  private initFaceLib(groups) {
    const algorithmMetadata = JSON.parse(this.appInfo.algorithmMetadata)
    if (algorithmMetadata.FaceDbName) {
      this.faceLib = groups.filter(item => item.id === algorithmMetadata.FaceDbName)[0]
    }
  }

  private appChange(val) {
    const temp = this.apps.filter(item => item.name === val)
    if (temp.length > 0) {
      this.appInfo = temp[0]
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
