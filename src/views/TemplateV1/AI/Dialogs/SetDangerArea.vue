<template>
  <el-dialog
    title="危险区域检测"
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
      label-width="140px"
    >
      <el-form-item label="左上比例坐标:" prop="leftTop" class="form-with-tip">
        <el-input v-model="form.leftTop" class="fixed-width" />
        <div class="form-tip">逗号分隔的x,y轴百分比（0-100之间）</div>
      </el-form-item>
      <el-form-item label="右上比例坐标:" prop="rightTop" class="form-with-tip">
        <el-input v-model="form.rightTop" class="fixed-width" />
        <div class="form-tip">逗号分隔的x,y轴百分比（0-100之间）</div>
      </el-form-item>
      <el-form-item label="右下比例坐标:" prop="rightDown" class="form-with-tip">
        <el-input v-model="form.rightDown" class="fixed-width" />
        <div class="form-tip">逗号分隔的x,y轴百分比（0-100之间）</div>
      </el-form-item>
      <el-form-item label="左下比例坐标:" prop="leftDown" class="form-with-tip">
        <el-input v-model="form.leftDown" class="fixed-width" />
        <div class="form-tip">逗号分隔的x,y轴百分比（0-100之间）</div>
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
  name: 'SetDangerArea'
})
export default class extends Vue {
  @Prop() private currentAlgorithm?: any
  private dialogVisible = true
  private form: any = {
    leftTop: '',
    leftDown: '',
    rightTop: '',
    rightDown: ''
  }
  private rules = {
    leftTop: [
      { required: true, message: '请输入左上角坐标', trigger: 'blur' },
      { validator: this.validatePoint, trigger: 'blur' }
    ],
    leftDown: [
      { required: true, message: '请输入左下角坐标', trigger: 'blur' },
      { validator: this.validatePoint, trigger: 'blur' }
    ],
    rightTop: [
      { required: true, message: '请输入右上角坐标', trigger: 'blur' },
      { validator: this.validatePoint, trigger: 'blur' }
    ],
    rightDown: [
      { required: true, message: '请输入右下角坐标', trigger: 'blur' },
      { validator: this.validatePoint, trigger: 'blur' }
    ]
  }

  mounted() {
    if (this.currentAlgorithm && this.currentAlgorithm.algorithmMetadata) {
      const dangerZone = JSON.parse(this.currentAlgorithm.algorithmMetadata).dangerZone
      this.form.leftTop = dangerZone.slice(0, 2).join(',')
      this.form.rightTop = dangerZone.slice(2, 4).join(',')
      this.form.rightDown = dangerZone.slice(4, 6).join(',')
      this.form.leftDown = dangerZone.slice(6, 8).join(',')
    }
  }

  private validatePoint(rule: any, value: string, callback: Function) {
    const pointReg = /^\d+,\d+$/
    if (!pointReg.test(value)) {
      callback(new Error('格式错误，请输入逗号分隔的横纵轴百分比'))
    } else {
      const numberArr = value.split(',').map(item => Number(item))
      if (numberArr[0] >= 0 && numberArr[0] <= 100 && numberArr[1] >= 0 && numberArr[1] <= 100) {
        callback()
      } else {
        callback(new Error('请输入0-100之间的数字'))
      }
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
        const dangerZone = [this.form.leftTop, this.form.rightTop, this.form.rightDown, this.form.leftDown].join(',').split(',')
        this.$emit('on-close', { val: JSON.stringify({ dangerZone }), refresh: true })
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
