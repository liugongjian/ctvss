<template>
  <div class="dashboard-wrap-overview__item">
    <el-card class="dashboard-wrap-overview__item__card">
      <div slot="header">
        <span>{{ title }}</span>
        <slot name="header" />
      </div>
      <slot />
    </el-card>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  name: 'DashboardContainer'
})
export default class extends Vue {
  @Prop() private title?: string
}
</script>
