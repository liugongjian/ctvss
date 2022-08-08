<template>
  <div class="ibox-container">
    <div>222</div>
    <router-view />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
@Component({
  name: 'IBox',
  components: {
  }
})

export default class IBox extends Vue {
  // public loading = {
  //   'dirTree': false
  // }
  mounted() {
    console.log(this.loading)
  }
}
</script>
<style lang="scss" scoped>
.ibox-container {
  color: red;
}
</style>
