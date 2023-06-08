<template>
  <div>
    <div class="card-wrapper">
      <PicCard
        v-for="(pic, index) in alarms"
        :key="index"
        :pic="pic"
        :type="10014"
        @showDialogue="showDialogue"
      />
    </div>
    <PicDialogue v-if="dialogueVisibile" :dialogue-pic="dialoguePic" :visible.sync="dialogueVisibile" />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import PicCard from '@vss/ai/component/PicCard.vue'
import PicDialogue from './components/PicDialogue.vue'


@Component({
  name: 'AlarmCardList',
  components: {
    PicCard,
    PicDialogue
  }
})
export default class extends Vue {
  @Prop({ default: [] }) alarms

  private dialogueVisibile = false

  private dialoguePic = null

  private currentIndex = 0

  private showDialogue(val) {
    console.log(1111)
    this.dialoguePic = { ...val, code: '10014' }
    this.dialogueVisibile = true
  }
}

</script>

<style lang="scss" scoped>
.card-wrapper {
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  overflow-y: auto;
}
</style>
