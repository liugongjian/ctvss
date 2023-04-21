<template>
  <el-dialog
    v-if="visible"
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
import { Component, Prop, Vue } from 'vue-property-decorator'
import AlgoDetail from '@vss/ai/component/AlgoDetail.vue'


@Component({
  name: 'Dialogue',
  components: {
    AlgoDetail
  }
})
export default class extends Vue {
  @Prop()
  public visible

  private closeDialog(){
    this.$emit('update:visible', false)
    this.$emit('refresh')
  }
}
</script>
<style lang="scss" scoped>

</style>
