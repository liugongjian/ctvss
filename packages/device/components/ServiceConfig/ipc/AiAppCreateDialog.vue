<template>
  <el-dialog
    v-if="showCreateAiAppDialog"
    title="创建AI应用"
    :visible="true"
    :close-on-click-modal="false"
    width="900px"
    center
    append-to-body
    @close="closeDialog"
  >
    <algo-detail quick-flag @close="closeDialog" />
  </el-dialog>
</template>
<script lang="ts">
import { Component, VModel, Vue } from 'vue-property-decorator'
import AlgoDetail from '@vss/ai/component/AlgoDetail.vue'


@Component({
  name: 'Dialogue',
  components: {
    AlgoDetail
  }
})
export default class extends Vue {
  @VModel()
  public showCreateAiAppDialog

  private closeDialog(){
    this.showCreateAiAppDialog = false
    this.$emit('refresh')
  }
}
</script>
