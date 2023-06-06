<template>
  <div>
    a
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

}

</script>
