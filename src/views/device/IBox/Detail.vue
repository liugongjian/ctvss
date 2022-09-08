<template>
  <div class="ibox-detail">
    Detail {{ text }}
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'IBoxDetail',
  components: {
  }
})

export default class IBoxList extends Vue {
  async mounted() {
    this.text = '乌拉~'
  }
}
</script>
<style lang="scss" scoped>
.ibox-list {
  margin-right: 200px;
}
</style>
