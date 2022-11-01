import { Component, Vue } from 'vue-property-decorator'
import {
  getIboxFrames
} from '@/api/ibox'

@Component
export default class AlgoMixin extends Vue {
  public frameImage!: any
  public async initFrame(isIbox = true, deviceId = '') {
    const res = await getIboxFrames({ deviceId: isIbox ? this.$route.query.deviceId : deviceId })
    if (res) {
      const { frames = [] }: any = res
      const { frame = '' } = frames[0] || []
      if (!frame) {
        this.$message.warning('暂时获取不到截图，请稍后再试')
      } else {
        this.frameImage = frame
      }
    }
  }
}
