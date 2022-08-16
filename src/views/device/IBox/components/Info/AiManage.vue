<template>
  <div class="ibox-list" />
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'DeviceList',
  components: {
  }
})

export default class IBoxList extends Vue {
  public tableData = []

  async mounted() {

  }
}
</script>
