<template>
  <el-dialog
    :title="`新建${activeInfo.label}`"
    :visible="showAddDialog"
    :append-to-body="true"
    width="30%"
    :before-close="handleClose"
  >
    <span>这是一段信息</span>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="sureThis">确 定</el-button>
      <el-button @click="cancelThis">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({
  name: 'addCustomDialog',
  components: {
  }
})

export default class addCustomDialog extends Vue {
  @Prop() private activeInfo: any
  @Prop() private showAddDialog: boolean

  private sureThis() {

  }

  private cancelThis() {
    this.$parent.closeThis()
  }

  private handleClose() {

  }
}
</script>

<style  lang="scss" scoped>

</style>
