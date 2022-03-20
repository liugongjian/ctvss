<template>
  <ElDatePanel ref="panel" @pick="pick" />
</template>
<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import ElDatePanel from 'element-ui/packages/date-picker/src/panel/date.vue'

@Component({
  name: 'DatePanel',
  components: {
    ElDatePanel
  }
})
export default class extends Vue {
  @Prop()
  public pickerOptions

  @Prop()
  public value

  public get panel(): any {
    return this.$refs.panel
  }

  @Watch('value')
  public onValueChange() {
    const panel: any = this.$refs.panel
    panel.value = new Date(this.value)
  }

  public mounted() {
    const panel: any = this.$refs.panel
    panel.visible = true
    panel.disabledDate = this.pickerOptions.disabledDate
    panel.cellClassName = this.pickerOptions.cellClassName
    panel.changeCalendar = this.pickerOptions.changeCalendar
  }

  public pick(date) {
    this.$emit('change', date.getTime())
  }
}
</script>
