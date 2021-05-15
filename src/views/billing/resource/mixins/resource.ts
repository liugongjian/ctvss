import { Component, Vue } from 'vue-property-decorator'
import { getResources } from '@/api/billing'

@Component
export default class ResourceMixin extends Vue {
  public type = ''
  public loading = false
  public dataList: any = []

  public mounted() {
    this.getResource()
  }

  /**
   * 加载资源包列表
   */
  public async getResource() {
    try {
      this.loading = true
      let params: any = {
        type: this.type
      }
      let res: any = await getResources(params)
      this.dataList = res.list
    } catch (e) {
      this.dataList = [
        {
          id: '111',
          name: '上行带宽包-100路-2Mbps码率-2Mbps带宽',
          amountDevice: 120,
          remainedDevice: 12,
          rate: 2,
          bandwidth: 2,
          aiType: '秒级',
          duration: '30天',
          startDatetime: '2021-05-01 23:23:23',
          endDatetime: '2021-05-01 23:23:23'
        }
      ]
    } finally {
      this.loading = false
    }
  }
}
