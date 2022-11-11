<template>
  <el-dialog
    title="设备地址"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="500px"
    center
    @close="closeDialog(false)"
  >
    <el-form 
      ref="exportAddressForm"
      :v-model="exportAddressForm"
    >
      <el-form-item label="地址">
        <div v-for="(address,index) in exportAddressForm.addressArr" :key="address.code">
          <el-cascader
            ref="exportAddressCascader"
            :options="selectedRegionList"
            :props="prop"
            clearable
            popper-class="address-cascader"
            @change="onDeviceAddressChange"
          />
        </div>
      </el-form-item>
    </el-form>
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

  public exportAddressForm: any = {
    addressArr: [{
      code: '',
      label: ''
    }]
  }

  // public 

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
    console.log('this.$refs[\'exportAddressCascader\']---->', this.$refs['exportAddressCascader'].length)
    // const checkedNodes = ( this.$refs['exportAddressCascader'] as any).getCheckedNodes()[0]
    // const { pathLabels } = checkedNodes
    // console.log('pathLabels------>', pathLabels.join('/'))

    
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
<style lang="scss" scoped>
::v-deep .el-dialog {
  .el-form {
    .el-cascader {
      .el-input {
        width: 100%;
      }
    }
  }
}

</style>