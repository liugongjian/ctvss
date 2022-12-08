<template>
  <el-dialog
    title="IP访问限制"
    :visible="true"
    width="30%"
    :before-close="handleClose"
    center
  >
    <el-form ref="form" :model="form" label-width="130px">
      <el-form-item label="访问名单类型" prop="kind">
        <el-radio-group v-model="form.kind" @input="changeRadioValue">
          <el-radio label="black">黑名单</el-radio>
          <el-radio label="white">白名单</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="`${showName}列表`" prop="list">
        <el-input v-model="form.list" type="textarea" />
        <template slot="label">
          {{ `${showName}列表` }}:
          <el-popover
            placement="top-start"
            width="400"
            trigger="hover"
            :open-delay="300"
            content="支持添加IP网段，例如192.168.0.1/24（多个IP使用回行分隔）"
          >
            <svg-icon slot="reference" class="form-question" name="help" />
          </el-popover>
        </template>
      </el-form-item>
      <el-form-item label="是否启用" prop="delivery">
        <el-switch v-model="form.ifUse" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="saveThis">保 存</el-button>
    </span>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
@Component({
  name: 'IpRestriction'
})
export default class extends Vue {
  // @Prop() private

  private form = {
    kind: 'black',
    list: '',
    ifUse: true
  }

  private showList = {
    'white': '白名单',
    'black': '黑名单'
  }

  private showName: string = ''

  mounted() {
    // Todo 根据接口返回 修改
    this.showName = this.showList[this.form.kind]
  }

  private handleClose() {
    this.form = {
      kind: 'black',
      list: '',
      ifUse: true
    }
    this.$emit('on-close')
  }

  private changeRadioValue(val: string) {
    console.log('val----->', val)
    this.showName = this.showList[this.form.kind]
  }

  private saveThis() {
    console.log('save')
    this.handleClose()
  }
}
</script>
