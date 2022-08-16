<template>
  <div>
    <el-form
      ref="viidForm"
      :rules="rules"
      :model="viidForm"
      label-position="right"
      label-width="135px"
    >
      <el-form-item label="接入协议:" prop="inProtocol">
        <el-radio v-for="(value, key) in viidInProtocolType" :key="key" v-model="viidForm.inProtocol" :label="key">{{ value }}</el-radio>
      </el-form-item>
      <el-form-item label="接入类型:" prop="apeType">
        <el-select
          v-model="viidForm.apeType"
          placeholder="请选择"
        >
          <el-option
            v-for="(value, key) in apeType"
            :key="key"
            :label="value"
            :value="key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="GA1400凭证:" prop="certId">
        <el-select v-model="viidForm.certId" :loading="loading.account">
          <el-option
            v-for="item in ga1400AccountList"
            :key="item.id"
            :label="item.userName"
            :value="item.id"
          />
        </el-select>
        <el-button
          type="text"
          class="ml10"
          @click="openDialog('createGa1400Certificate')"
        >
          新建GA1400凭证
        </el-button>
      </el-form-item>
    </el-form>
    <create-ga1400-certificate
      v-if="dialog.createGa1400Certificate"
      @on-close="closeDialog('createGa1400Certificate', ...arguments)"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { ViidInProtocolType, ApeType } from '../dicts/index'
import CreateGa1400Certificate from '@/views/certificate/ga1400/components/CreateDialog.vue'
import { getList as getGa1400List } from '@/api/certificate/ga1400'

@Component({
  name: 'ViidCreateForm',
  components: {
    CreateGa1400Certificate
  }
})
export default class extends Vue {
  private viidInProtocolType = ViidInProtocolType
  private apeType = ApeType
  private ga1400AccountList = []
  private viidForm = {
    inProtocol: 'ga1400',
    apeType: 'APE',
    certId: ''
  }
  private rules = {}
  private loading = {
    account: false
  }
  private dialog = {
    createGa1400Certificate: false
  }

  private mounted() {
    this.getGa1400Accounts()
  }

  /**
   * 打开弹出框
   */
  private openDialog(type: string) {
    // @ts-ignore
    this.dialog[type] = true
  }

  /**
   * 关闭弹出框
   */
  private closeDialog(type: string, payload: any) {
    // @ts-ignore
    this.dialog[type] = false
    if (type === 'createGa1400Certificate' && payload === true) {
      this.getGa1400Accounts()
    }
  }

  /**
   * 获取ga1400账号
   */
  private async getGa1400Accounts() {
    try {
      this.loading.account = true
      const res = await getGa1400List({
        pageSize: 1000
      })
      this.ga1400AccountList = res.data
    } catch (e) {
      console.error(e)
    } finally {
      this.loading.account = false
    }
  }
}
</script>
