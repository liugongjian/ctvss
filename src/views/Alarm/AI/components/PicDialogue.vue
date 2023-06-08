<template>
  <el-dialog
    :visible="true"
    :fullscreen="true"
    :custom-class="`light-ai-image-fullscreen`"
    @close="dialogueClose"
  >
    <div slot="title">{{ dialoguePic && dialoguePic.deviceName }} | {{ dialoguePic && dialoguePic.time }}</div>
    <div class="ai-recognation__images__item__wrap ai-image-fullscreen__img">
      <div class="ai-recognation__images__item__img--wrap ai-image-fullscreen__img--wrap">
        <img v-if="dialoguePic" ref="dialogue" :src="dialoguePic.image" @load="onload">
        <Locations :type="dialoguePic.code" :img="dialoguePic" :clickable="true" @click-location="onLocationChanged" />
      </div>
      <Attributes
        v-if="dialoguePic.code === '10009'"
        class="ai-image-fullscreen__img--attributes"
        :type="dialoguePic.code"
        :img="dialoguePic"
        :attributes-index="currentLocationIndex"
      />
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import Locations from '@vss/ai/component/Locations.vue'
import Attributes from '@vss/ai/component/Attributes.vue'
import { parseMetaData, transformLocationAi } from '@vss/ai/util/ai'


@Component({
  name: 'PicDialogue',
  components: {
    Locations,
    Attributes,
  }
})
export default class extends Vue {

  @Prop() private visible
  @Prop() private dialoguePic = null
  private currentPic

  private mounted(){
    console.log('dilg:', this.visible)
  }

  private onLocationChanged(index: number) {
    this.currentLocationIndex = index
  }

  private onload() {
    const metaData = JSON.parse(this.dialoguePic.metadata)
    const locations = parseMetaData(this.dialoguePic.code, metaData)
    const img = this.$refs.dialogue
    this.currentPic = { ...this.dialoguePic, locations: transformLocationAi(locations, img) }
  }

  private dialogueClose() {
    this.$emit('update:visible', false)
  }

}
</script>
