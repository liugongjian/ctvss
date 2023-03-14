import { getResources } from '@/api/billing'
import { Component, Vue } from 'vue-property-decorator'

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
      const params: any = {
        type: this.type
      }
      const res: any = await getResources(params)
      this.dataList = res.resPkgList
    } catch (e) {
      console.log(e)
    } finally {
      this.loading = false
    }
  }

  /**
   * 资源包管理
   */
  public rowClick(row: any, type: string) {
    this.$router.push({
      name: 'BillingResourceManagement',
      query: {
        resourceId: row.resourceId
      },
      params: {
        type
      }
    })
  }
}
