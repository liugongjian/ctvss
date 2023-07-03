<template>
  <el-dialog
    :visible="true"
    :fullscreen="true"
    :custom-class="`light-ai-image-fullscreen`"
    @close="dialogueClose"
  >
    <div slot="title">{{ dialoguePic && dialoguePic.algoName }} | {{ dialoguePic && dialoguePic.captureTime && format(fromUnixTime(dialoguePic.captureTime), 'HH:mm:ss yyyy-MM-dd') }}</div>
    <div v-if="currentIndex > 0" class="ai-recognation__images__item__arrow" @click="changePic(-1)"><i class="el-icon-arrow-left" /></div>
    <div class="ai-recognation__images__item__wrap ai-image-fullscreen__img centered">
      <div class="ai-recognation__images__item__img--wrap ai-image-fullscreen__img--wrap">
        <img v-if="dialoguePic" ref="dialoguePic" :src="dialoguePic.image" @load="onload" />
        <LocationsNew v-if="picRatio.ratioW && dialoguePic && refresh" :img="dialoguePic" :ratio="picRatio" :clickable="true" @click-location="onLocationChanged" />
      </div>
    </div>
    <div v-if="currentIndex < alarms.length - 1" class="ai-recognation__images__item__arrow" @click="changePic(1)"><i class="el-icon-arrow-right" /></div>
    <AttributesNew
      v-if="dialoguePic && dialoguePic.algoCode === '10009'"
      class="ai-image-fullscreen__img--attributes"
      :img="dialoguePic"
      :attributes-index="currentLocationIndex"
    />
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import LocationsNew from '@vss/ai/component/LocationsNew.vue'
import AttributesNew from '@vss/ai/component/AttributesNew.vue'
import { format, fromUnixTime } from 'date-fns'


@Component({
  name: 'PicDialogue',
  components: {
    LocationsNew,
    AttributesNew,
  }
})
export default class extends Vue {

  @Prop() private visible
  @Prop() private alarms
  @Prop({ default: 0 }) private currentIndex

  private refresh = true

  private currentLocationIndex = 0

  private picRatio: any = {}

  private showRightArr = true

  private format = format

  private fromUnixTime = fromUnixTime

  private get dialoguePic(){
    return this.alarms[this.currentIndex]
  }

  private onload(){
    const imgEle: any = this.$refs.dialoguePic
    this.picRatio = {
            imgNaturalWidth: imgEle.naturalWidth,
            imgNaturalHeight: imgEle.naturalHeight,
            clientHeight: imgEle.clientHeight,
            clientWidth: imgEle.clientWidth,
            ratioW: imgEle.clientWidth / imgEle.naturalWidth,
            ratioH: imgEle.clientHeight / imgEle.naturalHeight
          }
  }

  private onLocationChanged(index: number) {
    this.currentLocationIndex = index
  }

  private dialogueClose() {
    this.$emit('update:visible', false)
  }

  private changePic(step){
    this.refresh = false
    const newIndex = this.currentIndex + step
    if (newIndex > -1 && newIndex <= this.alarms.length - 1){
      this.$emit('update:current-index', newIndex)
    }
    this.$nextTick(() => { this.refresh = true })
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
  width: 75vw;
  & > div{
    width: 100%;
    img {
      width: 100%;
      height: 100%;
      object-fit: fill;
    }
  }
}
.full{
  width: 92vw;
}
.ai-recognation__images__item__img--wrap{
  position: relative;
}
.ai-attributes{
  align-self: flex-start;
}
</style>
