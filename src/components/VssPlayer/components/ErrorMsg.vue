<!-- 错误信息 -->
<template>
  <div class="error-msg">{{ errorMsg }}</div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({
  name: 'ErrorMsg'
})
export default class extends Vue {
  @Prop()
  private errorMsg
}
</script>
<style lang="scss" scoped>
  .error-msg {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    text-align: center;
    color: #fff;
  }
</style>
