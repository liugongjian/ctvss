<template>
  <div>
    <el-select v-model="inUserName" class="certificate-select" :loading="loading" :disabled="disabled">
      <el-option
        v-for="item in accountList"
        :key="item[apiMapping[type].label]"
        :label="item[apiMapping[type].label]"
        :value="item[apiMapping[type].value]"
      />
    </el-select>
    <el-button
      v-if="!disabled"
      type="text"
      class="ml10"
      @click="openDialog(type)"
    >
      新建{{ inProtocol[type] }}凭证
    </el-button>
    <create-gb28181-certificate
      v-if="dialog[inVideoProtocolEnum.Gb28181]"
      @on-close="closeDialog(inVideoProtocolEnum.Gb28181, ...arguments)"
    />
    <create-ga1400-certificate
      v-if="dialog[inViidProtocolEnum.Ehome]"
      @on-close="closeDialog(inViidProtocolEnum.Ga1400, ...arguments)"
    />
    <create-ehome-certificate
      v-if="dialog[inVideoProtocolEnum.Ehome]"
      @on-close="closeDialog(inVideoProtocolEnum.Ehome, ...arguments)"
    />
  </div>
</template>

<script lang='ts'>
import { Component, Prop, VModel, Vue } from 'vue-property-decorator'
import { getGb28181CertificateList, getGa1400CertificateList, getEhomeCertificateList } from '@vss/device/api/certificate'
import { InVideoProtocolEnum, InViidProtocolEnum } from '@vss/device/enums'
import { InVideoProtocol, InViidProtocol } from '@vss/device/dicts'
import CreateGb28181Certificate from './Certificate/Gb28181/components/CreateDialog.vue'
import CreateGa1400Certificate from './Certificate/Ga1400/components/CreateDialog.vue'
import CreateEhomeCertificate from './Certificate/Ehome/components/CreateDialog.vue'

@Component({
  name: 'CertificateSelect',
  components: {
    CreateGb28181Certificate,
    CreateGa1400Certificate,
    CreateEhomeCertificate
  }
})
export default class extends Vue {
  @Prop({ default: false })
  private disabled: boolean

  @Prop()
  private type

  @VModel()
  private inUserName?: string 

  private inVideoProtocolEnum = InVideoProtocolEnum
  private inViidProtocolEnum = InViidProtocolEnum
  private inProtocol = {
    ...InVideoProtocol,
    ...InViidProtocol
  }

  public dialog = {
    [InVideoProtocolEnum.Gb28181]: false,
    [InViidProtocolEnum.Ga1400]: false,
    [InVideoProtocolEnum.Ehome]: false
  }

  private apiMapping = {
    [InVideoProtocolEnum.Gb28181]: {
      api: getGb28181CertificateList,
      body: 'gbCerts',
      label: 'userName',
      value: 'userName'
    },
    [InViidProtocolEnum.Ga1400]: {
      api: getGa1400CertificateList,
      body: 'data',
      label: 'username',
      value: 'id'
    },
    [InVideoProtocolEnum.Ehome]: {
      api: getEhomeCertificateList,
      body: 'data',
      label: 'username',
      value: 'userName'
    }
  }

  public accountList = []

  private loading = false

  private mounted() {
    this.getAccounts()
  }

  /**
   * 获取账号
   */
  public async getAccounts() {
    try {
      this.loading = true
      const res = await this.apiMapping[this.type].api({
        pageSize: 1000
      })
      this.accountList = res[this.apiMapping[this.type].body]
    } catch (e) {
      console.error(e)
    } finally {
      this.loading = false
    }
  }

  /**
   * 打开弹出框
   */
  private openDialog(type: string) {
    this.dialog[type] = true
  }

  /**
   * 关闭弹出框
   */
  private closeDialog(type: string, payload: any) {
    this.dialog[type] = false
    if (type && payload === true) {
      this.getAccounts()
    }
  }
}
</script>
