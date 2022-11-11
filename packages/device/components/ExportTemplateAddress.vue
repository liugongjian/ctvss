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
      class="export-address-form"
    >
      <el-form-item label="地址：">
        <el-col v-loading="btnLoading" :span="20" class="cascader-box">
          <div
            v-for="(address, index) in exportAddressForm.addressArr"
            :key="address.key"
          >
            <el-cascader
              ref="exportAddressCascader"
              :props="prop"
              clearable
              popper-class="address-cascader"
              @change="onDeviceAddressChange"
            />
            <el-button
              v-if="index === 0"
              type="text"
              class="cascader-box__btn"
              :disabled="exportAddressForm.addressArr.length >= 5"
              @click="addAddress"
            >
              <i class="el-icon-circle-plus" />
            </el-button>
            <el-button
              v-else
              type="text"
              class="cascader-box__btn"
              @click="removeAddress(index)"
            >
              <i class="el-icon-remove" />
            </el-button>
          </div>
        </el-col>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="downloadLoading" @click="sureThis">
        下载模板
      </el-button>
      <el-button @click="closeDialog(false)">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getChildAddress } from '../api/region'
import axios from 'axios'
import ExportExcelTemplate from '../services/Device/DeviceExportTemplate'

@Component({
  name: 'ExportTemplateAddress'
})
export default class extends Vue {
  public dialogVisible = true

  public exportAddressForm: any = {
    addressArr: [
      {
        code: '',
        label: ''
      }
    ]
  }

  public btnLoading = false

  public downloadLoading = false

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

  public onDeviceAddressChange() {
    const arr = (this.$refs['exportAddressCascader'] as any).map(
      (item: any) => {
        item.dropDownVisible = false
        const {
          // label = '',  // 选中的label值
          // value = '',
          pathLabels = [] // 选中的完整label值
        } = item.getCheckedNodes()[0] || {}
        // this.exportAddressForm.addressArr[index].code = value
        // this.exportAddressForm.addressArr[index].label = label
        return pathLabels.join('/')
      }
    )
    this.selectedRegionList = arr
  }

  public async loadAddress(node, resolve) {
    try {
      this.btnLoading = true
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
    } finally {
      this.btnLoading = false
    }
  }

  public closeDialog(status: boolean) {
    this.dialogVisible = status
    this.$emit('on-close')
  }

  public addAddress() {
    this.exportAddressForm.addressArr.push({
      code: '',
      label: '',
      key: Date.now()
    })
  }

  public removeAddress(index: number) {
    this.exportAddressForm.addressArr.splice(index, 1)
  }

  public async sureThis() {
    console.log('this.selectedRegionList--->', this.selectedRegionList)
    
  }
}
</script>
<style lang="scss" scoped>
.export-address-form {
  ::v-deep .el-cascader {
    width: 70%;

    .el-input {
      width: 100%;
    }
  }
}

.cascader-box {
  &__btn {
    font-size: 22px;
    color: #000;
    margin-left: 20px;
    // padding: 6px 0;
    vertical-align: middle;
  }
}
</style>
