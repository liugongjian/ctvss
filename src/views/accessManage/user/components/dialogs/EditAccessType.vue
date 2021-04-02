<template>
  <el-dialog
    :title="dialogTitle"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    center
    width="500px"
    @close="closeDialog"
  >
    <el-row>
      <el-radio v-model="dialogData.val" label="a">编程访问</el-radio>
      <el-row class="item-tip">支持中英文字符、数字、下划线和短横线“-”，不超过20位</el-row>
    </el-row>
    <el-row>
      <el-radio v-model="dialogData.val" label="b">控制台访问</el-radio>
      <el-row class="item-tip">启用密码，允许用户登录到视频监控客户控制台</el-row>
    </el-row>
    <div slot="footer" align="center">
      <el-button type="primary" @click="submit">{{ '确定' }}</el-button>
      <el-button @click="closeDialog">取消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { addAIConfigGroupData } from '@/api/aiConfig'
import { log } from 'util'
@Component({
  name: 'AddGroup'
})
export default class extends Vue {
  @Prop() private dialogData: any
  private dialogTitle: string = '选择访问方式'
  private dialogVisible = true
  private accessType: any = ''
  private form: any = {
    name: '',
  }

  private rules = {
  }

  private mounted() {
  }

  private submit() {
    this.$emit('on-return', this.dialogData)
    this.$emit('on-close', false)
  }

  private closeDialog() {
    this.$emit('on-close', false)
  }

  private async doAddGroup() {}
}
</script>
<style lang="scss" scoped>
  .el-dialog {
    .el-row {
      margin: 10px 0;
      .item-tip {
        font-size: 13px;
        color: #999999;
        margin-left: 10px;
      }
    }
  }
</style>
