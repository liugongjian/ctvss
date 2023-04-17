<template>
  <el-dialog
    title="口罩检测配置"
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
      <el-form-item label="人脸面部阈值:" prop="faceRatio" class="form-with-tip">
        <el-input v-model="form.faceRatio" class="fixed-width" />
        <div class="form-tip">该值用于识别目标对象是否为人脸的阈值</div>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="setMaskDetection">确定</el-button>
      <el-button @click="closeDialog(false)">取消</el-button>
    </span>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({
  name: 'SetMaskDetection'
})
export default class extends Vue {
  @Prop() private currentAlgorithm?: any
  private dialogVisible = true
  private form: any = {
    faceRatio: '70'
  }
  private rules = {
    faceRatio: [
      { required: true, message: '请输入人脸面部阈值', trigger: 'blur' },
      { validator: this.validateFaceRatio, trigger: 'blur' }
    ]
  }

  mounted() {
    if (this.currentAlgorithm && this.currentAlgorithm.algorithmMetadata) {
      this.form = JSON.parse(this.currentAlgorithm.algorithmMetadata)
      this.form.faceRatio = (this.form.faceRatio * 100).toString()
    }
  }

  private validateFaceRatio(rule: any, value: string, callback: Function) {
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

  private setMaskDetection() {
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        this.dialogVisible = false
        const value = JSON.parse(JSON.stringify(this.form))
        value.faceRatio = (value.faceRatio / 100).toString()
        this.$emit('on-close', { val: JSON.stringify(value), refresh: true })
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
