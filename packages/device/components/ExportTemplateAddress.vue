<template>
  <el-dialog
    title="设备地址"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="500px"
    center
    @close="closeDialog(false)"
  >
    <el-cascader
      ref="exportAddressCascader"
      v-model="address"
      :options="selectedRegionList"
      :props="prop"
      clearable
      popper-class="address-cascader"
      @change="onDeviceAddressChange"
    />
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getChildAddress, getAddressAreaDir } from '../api/region'
import axios from 'axios'

@Component({
  name: 'ExportTemplateAddress'
})
export default class extends Vue {
  public dialogVisible = true

  public address = []

  public selectedRegionList = []

  public deviceAddresses = {
    code: '',
    level: ''
  }

  public prop: any = {
    value: 'code',
    label: 'name',
    children: 'children',
    checkStrictly: 'true',
    expandTrigger: 'hover',
    lazy: true,
    lazyLoad: this.loadAddress
  }

  public onDeviceAddressChange(region: any) {
    console.log('region------>', region)
  }

  public async loadAddress(node, resolve) {
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
      const list = await getChildAddress(
        node.data && node.data.code,
        node.level + 1,
        this.axiosSource.token
      )
      resolve(list)
    } catch (e) {
      node.loading = false
      node.loaded = false
    }
  }

  public closeDialog(status: boolean) {
    this.dialogVisible = status
    this.$emit('on-close')
  }
}
</script>
