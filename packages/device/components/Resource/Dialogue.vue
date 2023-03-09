<template>
  <el-dialog
    title="创建AI应用"
    :visible.sync="visible"
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
import AlgoDetail from '@/views/AI/AppList/component/AlgoDetail.vue'


@Component({
  name: 'Dialogue',
  components: {
    AlgoDetail
  }
})
export default class extends Vue {
  @Prop()
  public visible

  private mounted(){
    console.log(this.$route.query)
  }

  private closeDialog(){
    this.$emit('update:visible', false)
  }
}
</script>
<style lang="scss" scoped>

</style>
