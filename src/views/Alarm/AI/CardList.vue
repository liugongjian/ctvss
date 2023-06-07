<template>
  <div v-if="device.deviceId.length > 0 && picInfos.length > 0 && !queryLoading.pic" class="card-wrapper">
    <PicCard
      v-for="(pic, index) in picInfos"
      :key="index"
      :pic="pic"
      :type="appInfo.algorithm.code"
      @showDialogue="showDialogue"
    />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import PicCard from '@vss/ai/component/PicCard.vue'

@Component({
  name: 'alarm-card-list',
  components: {
    PicCard
  }
})
export default class extends Vue {
  private picInfos = []
}

</script>
