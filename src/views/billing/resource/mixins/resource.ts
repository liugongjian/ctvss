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
      this.dataList = res.resPkgList
    } catch (e) {
      console.log(e)
    } finally {
      this.loading = false
    }
  }
}
