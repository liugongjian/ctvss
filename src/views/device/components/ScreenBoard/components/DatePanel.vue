<script lang="ts">
import { Component, Prop, Watch, Mixins } from 'vue-property-decorator'
import ElDatePanel from 'element-ui/packages/date-picker/src/panel/date.vue'

@Component({
  name: 'DatePanel'
})
export default class extends Mixins(ElDatePanel) {
  @Prop()
  private pickerOptions

  @Prop()
  private currentDate

  public visible = true

  @Watch('currentDate', {
    immediate: true
  })
  private onCurrentDateChange() {
    // @ts-ignore
    this.value = new Date(this.currentDate)
  }

  public mounted() {
    this.disabledDate = this.pickerOptions.disabledDate
    this.cellClassName = this.pickerOptions.cellClassName
    this.changeCalendar = this.pickerOptions.changeCalendar
  }
}

</script>
