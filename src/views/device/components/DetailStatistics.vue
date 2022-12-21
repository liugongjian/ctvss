<template>
  <div>
    <record-statistics
      :device-id="deviceId"
      :in-protocol="inProtocol"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import RecordStatistics from './RecordStatistics.vue'
// import { getAIConfigGroupData } from '@/api/aiConfig'

@Component({
  name: 'DetailStatistics',
  components: {
    RecordStatistics
  }
})
export default class extends Vue {
  @Prop() private deviceId!: any
  @Prop() private inProtocol!: any
}
</script>
<style lang="scss" scoped>
</style>
