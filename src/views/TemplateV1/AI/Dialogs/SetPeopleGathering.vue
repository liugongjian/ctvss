<template>
  <el-dialog
    title="人员聚集配置"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="40%"
    @close="closeDialog(false)"
  >
    <el-form
      ref="dataForm"
      :rules="rules"
      :model="form"
      label-position="right"
      label-width="160px"
    >
      <el-form-item label="人员数量阈值:" prop="pedThreshold" class="form-with-tip">
        <el-input v-model="form.pedThreshold" class="fixed-width" />
        <div class="form-tip">人员数量达到该阈值即可触发人员聚集告警</div>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="setPedThreshold">确定</el-button>
      <el-button @click="closeDialog(false)">取消</el-button>
    </span>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({
  name: 'SetPeopleGathering'
})
export default class extends Vue {
  @Prop() private currentAlgorithm?: any
  private dialogVisible = true
  private form = {
    pedThreshold: '5'
  }
  private rules = {
    pedThreshold: [
      { required: true, message: '请输入人员数量阈值', trigger: 'blur' },
      { validator: this.validatePedThreshold, trigger: 'blur' }
    ]
  }

  mounted() {
    if (this.currentAlgorithm && this.currentAlgorithm.algorithmMetadata) {
      this.form = JSON.parse(this.currentAlgorithm.algorithmMetadata)
    }
  }

  private validatePedThreshold(rule: any, value: string, callback: Function) {
    const thresholdReg = /^\d+$/
    if (value && (!thresholdReg.test(value) || Number(value) < 1 || Number(value) > 100)) {
      callback(new Error('请输入1-100之间的正整数'))
    } else {
      callback()
    }
  }

  private closeDialog(refresh: boolean) {
    this.dialogVisible = false
    this.$emit('on-close', { val: '', refresh: refresh })
  }

  private setPedThreshold() {
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        this.dialogVisible = false
        this.$emit('on-close', { val: JSON.stringify(this.form), refresh: true })
      }
    })
  }
}
</script>
<style lang="scss" scoped>
  .fixed-width.el-input, .fixed-width.el-select, .fixed-width.el-textarea {
    width: 400px;
  }
</style>
