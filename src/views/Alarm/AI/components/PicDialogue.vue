<template>
  <el-dialog
    :visible="true"
    :fullscreen="true"
    :custom-class="`light-ai-image-fullscreen`"
    @close="dialogueClose"
  >
    <div slot="title">{{ dialoguePic && dialoguePic.algoName }} | {{ dialoguePic && dialoguePic.captureTime && format(fromUnixTime(dialoguePic.captureTime / 1000), 'HH:mm:ss yyyy-MM-dd') }}</div>
    <div class="ai-recognation__images__item__arrow" @click="changePic(-1)"><i class="el-icon-arrow-left" /></div>
    <div class="ai-recognation__images__item__wrap ai-image-fullscreen__img centered">
      <div class="ai-recognation__images__item__img--wrap ai-image-fullscreen__img--wrap">
        <img v-if="dialoguePic" ref="dialogue" :src="dialoguePic.image" />
        <Locations :type="dialoguePic.algoCode" :img="dialoguePic" :clickable="true" @click-location="onLocationChanged" />
      </div>

      <!-- <Attributes
        v-if="dialoguePic.code === '10009'"
        class="ai-image-fullscreen__img--attributes"
        :type="dialoguePic.code"
        :img="dialoguePic"
        :attributes-index="currentLocationIndex"
      /> -->
    </div>
    <div class="ai-recognation__images__item__arrow" @click="changePic(1)"><i class="el-icon-arrow-right" /></div>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import Locations from '@vss/ai/component/Locations.vue'
import Attributes from '@vss/ai/component/Attributes.vue'
import { format, fromUnixTime } from 'date-fns'


@Component({
  name: 'PicDialogue',
  components: {
    Locations,
    Attributes,
  }
})
export default class extends Vue {

  @Prop() private visible
  @Prop() private alarms
  @Prop({ default: 0 }) private currentIndex

  private picIndex = 0

  private currentLocationIndex = 0


  private format = format

  private fromUnixTime = fromUnixTime

  private get dialoguePic(){
    return this.alarms[this.currentIndex]
  }

  private onLocationChanged(index: number) {
    this.currentLocationIndex = index
  }

  private dialogueClose() {
    this.$emit('update:visible', false)
  }

  private changePic(step){
    const newIndex = this.currentIndex + step
    if (newIndex > -1 || newIndex < this.alarms.length){
      this.$emit('update:current-index', newIndex)
    }
  }

}
</script>

<style lang="scss" scoped>
::v-deep{
  .el-dialog__body{
    display: flex;
    justify-content: center;
    .ai-recognation__images__item__arrow {
      cursor: pointer;
      & > i {
        font-size: 36px;
      }

    }
  }
}
.centered{
  width: 92vw;
  & > div{
    width: 100%;
    img {
      width: 100%;
      height: 100%;
      object-fit: fill;
    }
  }

}
</style>
