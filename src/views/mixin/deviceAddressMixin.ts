import { Component, Vue } from 'vue-property-decorator'
import { getChildAddress, getAddressAreaDir } from '@/api/device'
import { suffixZero } from '@/utils/number'

@Component
export default class CreateMixin extends Vue {
  public addressProps: any = {
    value: 'code',
    label: 'name',
    children: 'children',
    checkStrictly: 'true',
    expandTrigger: 'hover',
    lazy: true,
    lazyLoad: this.loadChildAddress
  }

  public form: any = {
    address: [],
    gbRegion: '',
    gbRegionLevel: ''
  }

  public selectedRegionList = []

  /**
   * 初始化回显设备地址, 将gbRegion转成el-cascader格式的数组
   */
  public async cascaderInit() {
    if (!this.form.gbRegion) return
    const gbRegionLevel = parseInt(this.form.gbRegionLevel)
    const res = await getAddressAreaDir({
      code: gbRegionLevel < 4 ? this.form.gbRegion.substring(0, 6) : this.form.gbRegion
    })
    this.selectedRegionList = res.area
    // 解析gb region
    const list = []
    for (let i = 0; i < gbRegionLevel; i++) {
      let code = this.form.gbRegion!.substring(0, (i + 1) * 2)
      if (i < 3) {
        code = suffixZero(code, 6)
      } else {
        code = suffixZero(code, 8)
      }
      list.push(code)
    }
    this.$nextTick(() => {
      this.form.address = list
      this.addressChange()
    })
  }

  /**
  /**
   * 当选中设备地址变化时触发
   */
  public async addressChange() {
    if (!this.form.address) return
    const addressCascader: any = this.$refs['addressCascader']
    if (addressCascader && addressCascader.getCheckedNodes()[0]) {
      addressCascader.dropDownVisible = false // 选择后自动关闭弹框
      const currentAddress = addressCascader.getCheckedNodes()[0].data
      this.form.gbRegion = suffixZero(currentAddress.code, 8) // 不足8位的补0
      this.form.gbRegionLevel = currentAddress.level
    }
  }

  /**
   * 动态加载设备地址列表
   */
  public async loadChildAddress(node, resolve) {
    if (node.data && node.data.leaf) {
      resolve([])
      return
    }
    let list = await getChildAddress(node.data && node.data.code, node.level + 1)
    resolve(list)
  }
}
