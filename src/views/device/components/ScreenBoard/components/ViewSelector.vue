<template>
  <el-radio-group v-model="view" class="screen-tools__btn" size="mini">
    <el-radio-button label="screen"><svg-icon name="timeline" /></el-radio-button>
    <el-radio-button label="list"><svg-icon name="list" /></el-radio-button>
  </el-radio-group>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Screen } from '@/views/device/models/Screen/Screen'

@Component({
  name: 'ViewSelector'
})
export default class extends Vue {
  @Prop()
  private screen: Screen

  private view = 'screen'
}

</script>
