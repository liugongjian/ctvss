<template>
  <el-cascader
    v-model="codeList"
    placeholder="请选择"
    :options="regionList"
    :disabled="disabled"
    @change="change"
  />
</template>

<script lang='ts'>
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { getRegions } from '../api/region'

@Component({
  name: 'RegionCascader'
})
export default class extends Vue {
  @Prop()
  private value?: string

  @Prop({
    default: false
  })
  private disabled?: boolean

  // 用户级联组件的设备地址数组
  private regionList = null

  // 当前组件中的code
  private codeList = null

  private loading = false

  // 监听code变化
  @Watch('value', {
    immediate: true
  })
  private async onRegionCodeChange() {
    if (!this.regionList) {
      await this.getRegionList()
    }
    this.codeList = this.getRegionPath(this.regionList, this.value)
  }

  /**
   * 递归查找目标区域的所在路径
   */
  private getRegionPath(regions: any, target: string) {
    let path: Array<any> = []
    try {
      const _find: any = function(path: Array<string>, children: any, parentValue: any) {
        for (let i = 0; i < children.length; i++) {
          const item = children[i]
          item.children && _find(path, item.children, item.value)
          if (item.value === target) {
            path.push(parentValue)
            path.push(item.value)
            throw new Error('found')
          }
        }
      }
      _find(path, regions, null)
    // eslint-disable-next-line no-empty
    } catch (e) {}
    return path
  }

  /**
   * 获取接入区域列表
   */
  private async getRegionList() {
    this.loading = true
    try {
      this.regionList = await getRegions()
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  /**
   * 当选中设备地址变化时触发
   */
  private async change(codeList) {
    let code = codeList.length ? codeList[codeList.length - 1] : ''
    this.$emit('input', code)
  }
}
</script>
<style lang="scss">
  .address-cascader {
    .el-cascader-menu__list {
      min-width: 200px;
    }
  }
</style>
