<template>
  <div>
    <el-select v-model="value" :loading="loading">
      <el-option
        v-for="item in accountList"
        :key="item.userName"
        :label="item.userName"
        :value="item.userName"
      />
    </el-select>
    <el-button
      type="text"
      class="ml10"
      @click="openDialog('createGb28181Certificate')"
    >
      新建GB28181凭证
    </el-button>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { getList as getGbList } from '@/api/certificate/gb28181'

@Component({
  name: 'Certificate'
})
export default class extends Vue {
  @Prop()
  private value?: string

  public dialog = {
    createGb28181Certificate: false
  }

  public accountList = []

  private loading = false

  private mounted() {
    this.getGbAccounts()
  }

  /**
   * 获取国标账号
   */
  public async getGbAccounts() {
    try {
      this.loading = true
      const res = await getGbList({
        pageSize: 1000
      })
      this.accountList = res.gbCerts
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
    // @ts-ignore
    this.dialog[type] = true
  }

  /**
   * 关闭弹出框
   */
  private closeDialog(type: string, payload: any) {
    // @ts-ignore
    this.dialog[type] = false
    if (type === 'createGb28181Certificate' && payload === true) {
      this.getGbAccounts()
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
