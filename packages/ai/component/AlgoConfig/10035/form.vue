<template>
  <el-form-item label="检测项" prop="algorithmMetadata.animalDetectType">
    <el-radio-group v-model="form.algorithmMetadata.animalDetectType">
      <el-radio label="工作服模型1" />
      <el-radio label="工作服模型2" />
    </el-radio-group>
    <div>
      <el-checkbox-group v-model="type">
        <el-checkbox class="inside-pic" label="备选项1" border>
          <el-image :src="require('@/views/AI/assets/icon/10001.svg')" />
        </el-checkbox>
      </el-checkbox-group>
    </div>
  </el-form-item>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({
  name: 'form',
  components: {}
})
export default class extends Vue {
  @Prop() private form!: any
  private type = []

}
</script>
<style lang="scss" scoped>
.inside-pic {
  height: fit-content !important;
  display: inline-flex;
  align-items: center;
  ::v-deep .el-image__inner{
    width: 50px !important;
  }
}
</style>
