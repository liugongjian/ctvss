<template>
  <div>
    <div class="card-wrapper">
      <PicCardNew
        v-for="(pic, index) in alarms"
        :key="index"
        :pic="pic"
        :type="pic.algoCode"
        @showDialogue="showDialogue"
      />
    </div>
    <PicDialogue v-if="dialogueVisibile" :alarms="alarms" :current-index="currentIndex" :visible.sync="dialogueVisibile" />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import PicCardNew from '@vss/ai/component/PicCardNew.vue'
import PicDialogue from './components/PicDialogue.vue'


@Component({
  name: 'AlarmCardList',
  components: {
    PicCardNew,
    PicDialogue
  }
})
export default class extends Vue {
  @Prop({ default: [] }) alarms

  private dialogueVisibile = false


  private currentIndex = 0

  private showDialogue(val) {
    console.log(1111)
    this.currentIndex = this.alarms.findIndex(item => item.image === val.image)
    console.log(this.currentIndex)
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
