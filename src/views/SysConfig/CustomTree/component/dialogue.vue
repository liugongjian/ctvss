<template>
  <el-dialog :title="title" :visible="true" @close="cancel">
    <slot />
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script lang='ts'>
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({
  name: 'Dialogue',
  components: {
  }
})
export default class extends Vue {
  @Prop() private title: string
  private confirm() {
    this.$emit('dialogSubmit')
  }

  private cancel() {
    this.$emit('dialogCancel')
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-dialog {
  width: 480px;

  .dialog-footer {
    display: flex;
    justify-content: center;
  }
}
</style>
