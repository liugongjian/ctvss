<template>
  <el-cascader
    ref="addressCascader"
    v-model="address"
    :disabled="disabled"
    :options="selectedRegionList"
    :props="addressProps"
    clearable
    popper-class="address-cascader"
    @change="addressChange"
  />
</template>

<script lang='ts'>
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { getChildAddress, getAddressAreaDir } from '../api/region'
import { suffixZero } from '@vss/base/utils/number'
import axios from 'axios'

@Component({
  name: 'AddressCascader'
})
export default class extends Vue {
  @Prop()
  private code?: string

  @Prop()
  private level?: string

  @Prop({
    default: false
  })
  private disabled?: boolean

  // 级联属性
  private addressProps: any = {
    value: 'code',
    label: 'name',
    children: 'children',
    checkStrictly: 'true',
    expandTrigger: 'hover',
    lazy: true,
    lazyLoad: this.loadChildAddress
  }

  // 用户级联组件的设备地址数组
  private address = []

  // 当前组件中的code
  private _code = null

  // 回显列表数据
  private selectedRegionList = []

  private axiosSource = null

  // 监听code变化
  @Watch('code', {
    immediate: true
  })
  private onRegionCodeChange() {
    if (this.code && this.code !== this._code) {
      this.cascaderInit()
    }
  }

  private beforeDestroy() {
    const addressCascader: any = this.$refs['addressCascader']
    addressCascader.doDestroy()
    this.selectedRegionList = []
    this.axiosSource && this.axiosSource.cancel()
  }

  /**
   * 初始化回显设备地址, 将code转成el-cascader格式的数组
   */
  private async cascaderInit() {
    const level = parseInt(this.level)
    const res = await getAddressAreaDir({
      code: level < 4 ? this.code.substring(0, 6) : this.code
    })
    this.selectedRegionList = res.area
    // 解析gb region
    const list = []
    for (let i = 0; i < level; i++) {
      let code = this.code!.substring(0, (i + 1) * 2)
      if (i < 3) {
        code = suffixZero(code, 6)
      } else {
        code = suffixZero(code, 8)
      }
      list.push(code)
    }
    this.$nextTick(() => {
      this.address = list
    })
  }

  /**
   * 当选中设备地址变化时触发
   */
  private async addressChange(address) {
    let code = ''
    let level = ''
    if (address.length) {
      const addressCascader: any = this.$refs['addressCascader']
      addressCascader.dropDownVisible = false // 选择后自动关闭弹框
      const lastCode = address[address.length - 1]
      code = suffixZero(lastCode, 8) // 不足8位的补0
      level = address.length
    }

    this._code = code
    this.$emit('change', {
      code,
      level
    })
  }

  /**
   * 动态加载设备地址列表
   */
  private async loadChildAddress(node, resolve) {
    try {
      if (node && node.children && node.children.length) {
        throw new Error('Has children')
      }
      if (node.data && node.data.leaf) {
        resolve([])
        return
      }
      this.axiosSource && this.axiosSource.cancel()
      this.axiosSource = axios.CancelToken.source()
      const list = await getChildAddress(node.data && node.data.code, node.level + 1, this.axiosSource.token)
      resolve(list)
    } catch (e) {
      node.loading = false
      node.loaded = false
    }
  }

  /**
   * 根据关键词搜索
   */
  // private async beforeFilter() {
  //   const res = await getAddressAreaDir({
  //     code: '140213'
  //   })
  //   this.selectedRegionList = res.area
  // }
}
</script>
<style lang="scss">
  .address-cascader {
    .el-cascader-menu__list {
      min-width: 200px;
    }
  }
</style>
