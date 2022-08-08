<template>
  <div class="ibox-list">
    List
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'IBoxList',
  components: {
  }
})

export default class IBoxList extends Vue {

}
</script>
<style lang="scss" scoped>
.ibox-list {
  margin-right: 200px;
}
</style>
