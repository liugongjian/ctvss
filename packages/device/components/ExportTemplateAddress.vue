<template>
  <el-dialog
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="500px"
    class="export-address-dialog"
    @close="closeDialog(false)"
  >
    <div slot="title" class="export-adddress-dialog__title">
      <span>设备地址</span><p>最多同时添加五个设备地址</p>
    </div>
    
    <el-form
      ref="exportAddressForm"
      :model="exportAddressForm"
      class="export-address-form"
      label-width="100px"
    >
      <el-form-item
        v-for="(item, index) in exportAddressForm.address"
        :key="item.key"
        :label="`${index === 0 ? '地址：' : ''}`"
        prop="address"
        :rules="{
          type: 'array',
          required: true,
          validator: (rules, value, callback) =>
            validateAddress(rules, value, callback, index),
          trigger: 'change'
        }"
      >
        <el-cascader
          ref="exportAddressCascader"
          :model="item.address"
          :props="prop"
          clearable
          popper-class="address-cascader"
          @change="onDeviceAddressChange"
        />
        <el-button
          v-if="index === 0"
          type="text"
          class="cascader-box__btn"
          :disabled="exportAddressForm.address.length >= 5"
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
    address: [
      {
        code: '',
        pathLabels: '',
        address: ''
      }
    ]
  }

  public regionList = []

  public btnLoading = false

  public downloadLoading = false

  public addressA = []

  public selectedRegionList: any = []

  public prop: any = {
    value: 'code',
    label: 'name',
    address: 'name',
    level: 'level',
    children: 'children',
    checkStrictly: 'true',
    expandTrigger: 'hover',
    lazy: true,
    lazyLoad: this.loadAddress
  }

  // public rules = {
  //   address: [
  //     // { type: 'array', required: true, message: '请选择设备地址',  },
  //     { type: 'array', required: true,  validator: this.validateAddress, trigger: 'blur' }
  //   ]
  // }

  public validateAddress(
    rule: any,
    value: any,
    callback: Function,
    index: number
  ) {
    const errList = value.filter((item: any, idx: number) => {
      if (idx !== index) {
        return item.pathLabels && item.pathLabels === value[index].pathLabels
      }
    })
    if (errList.length > 0) {
      callback(new Error('请选择不同地址'))
    } else if (value[index].pathLabels === '') {
      callback(new Error('请选择地址'))
    } else {
      callback()
    }
  }

  public onDeviceAddressChange() {
    const arr = (this.$refs['exportAddressCascader'] as any).map(
      (item: any, index) => {
        item.dropDownVisible = false
        const {
          label = '', // 选中的label值
          value = '',
          level = '',
          pathLabels = [] // 选中的完整label值
        } = item.getCheckedNodes()[0] || {}
        this.exportAddressForm.address[index].code = value
        this.exportAddressForm.address[index].address = label
        this.exportAddressForm.address[index].pathLabels = pathLabels.join('/')
        return {
          label,
          value,
          pathLabels,
          level
        }
      }
    )
    this.selectedRegionList = arr
    this.regionList = arr
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
    this.exportAddressForm.address.push({
      code: '',
      label: '',
      key: Date.now()
    })
  }

  public removeAddress(index: number) {
    this.exportAddressForm.address.splice(index, 1)
  }

  public sureThis() {
    (this.$refs.exportAddressForm as any).validate(async (valid: boolean, errorInfo: any) => {
      if (valid) {
        try {
          this.downloadLoading = true
          // 数组去除空数据
          const arr = this.selectedRegionList.map((item: any)=>{
            return  item.pathLabels.join('/')
          })
          await ExportExcelTemplate.exportTemplate(arr)
          this.closeDialog(false)
        } catch (error) {
        } finally {
          this.downloadLoading = false
        }
      } else {
        //就像用户提示发生错误的消息
        console.log(errorInfo)
      }
    })
  }
}
</script>
<style lang="scss" scoped>
.export-address-dialog {
  ::v-deep .el-dialog {
    &__header {
      border-bottom: 1px solid #c3c3c3;
      padding: 0;

      span {
        font-size: 16px;
        height: 42px;
        display: inline-block;
        vertical-align: middle;
      }

      p {
        display: inline-block;
        font-size: 12px;
        padding-left: 10px;
        height: 42px;
        padding-top: 20px;
        margin: 0;
      }
    }

    &__headerbtn {
      top: 15px;
    }

    .export-adddress-dialog__title {
      // padding: 15px 0 0 20px;
      padding-left: 20px;
      height: 44px;
      line-height: 26px;
    }

    .el-dialog__body {
      padding: 10px 25px 30px;
    }
  }

  .export-address-form {
    ::v-deep .el-cascader {
      width: 70%;

      .el-input {
        width: 100%;
      }
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
