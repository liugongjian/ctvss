<template>
  <el-dialog
    title="变更带宽计费类型"
    append-to-body
    :visible.sync="outerVisible"
    custom-class="outer-dialog-charge"
    @close="cancelOuter"
  >
    <el-form
      ref="dataForm"
      :model="form"
      :rules="rules"
    >
      <el-form-item label="带宽计费模式" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio label="peak">按日峰值带宽</el-radio>
          <el-radio label="amount">按流量</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div class="desc">
      <p class="desc__title">计费须知</p>
      <p>1.流量：按照每日的实际流量计费；</p>
      <p>2.日带宽峰值：按照每日带宽每5分钟统计一个带宽峰值，每日得到288个值，取其中的最大值；</p>
      <p>3.计费方式由“日峰值带宽计费” → “流量计费”时，切换次日00:00生效；</p>
      <p>4.计费方式由“流量计费” → “日峰值带宽计费”时，切换次日00:00生效；</p>
      <p>5.变更生效前，允许多此进行变更操作，按照最终变更修改为准;</p>
      <p>6.在按需计费模式下，优先使用账户下已购买的带宽包，超出带宽包额度的部分按实际超出部分计费。</p>
    </div>
    <el-dialog
      title="变更提示"
      :visible.sync="innerVisible"
      append-to-body
      custom-class="inner-dialog-charge"
      @close="innerVisible = false"
    >
      <el-alert
        :title="warnText"
        type="warning"
        show-icon
        :closable="false"
      />
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="loading" @click="submit">确 定</el-button>
        <el-button @click="innerVisible = false">取 消</el-button>
      </div>
    </el-dialog>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="innerVisible = true">确 定</el-button>
      <el-button @click="cancelOuter">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'


@Component({
  name: 'Dialogue',
})
export default class extends Vue {
  @Prop()
  public visible

  private warnText = '您确定要变更带宽计费模式：从”按日峰值"计费改为“按流量”计费吗？点击确定后，新的计费方式将在次日00:00生效。'
  private outerVisible = false
  private innerVisible = false
  private loading = false
  private form = {
    type: 'peak'
  }
  private rules = {
    type: [
      { required: true, message: '请选择收费类型', trigger: 'blur' }
    ]
  }

  @Watch('visible', { immediate: true })
  private showDialog(){
    this.outerVisible = this.visible
  }

  private submit(){
    this.loading = true
    // await提交
    this.outerVisible = this.innerVisible = false
    this.loading = false
    this.$emit('update:visible', false)
  }

  private cancelOuter(){
    this.$emit('update:visible', false)
  }

}
</script>
<style lang="scss" scoped>
::v-deep .outer-dialog-charge {
  width: 700px !important;
}

::v-deep .inner-dialog-charge {
  width: 535px !important;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  margin-top: 50px;
}

.el-alert {
  ::v-deep &__content {
    color: #333;
  }

  ::v-deep &-warning {
    width: 22px;
    height: 22px;
  }

  background: #fff;
}

.desc {
  padding: 20px;
  font-size: 12px;
  color: #666;
  line-height: 22px;
  font-weight: 500;
  background: #fafafa;
  border: 1px solid rgba(221, 221, 221, 100%);

  &__title {
    font-size: 14px;
    color: #666;
    line-height: 20px;
    margin: 0;
  }
}
</style>
