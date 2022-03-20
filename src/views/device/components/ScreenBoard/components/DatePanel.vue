<script lang="ts">
/* tslint:disable */
import { Component, Prop, Watch, Mixins } from 'vue-property-decorator'
import ElDatePanel from 'element-ui/packages/date-picker/src/panel/date.vue'

@Component({
  name: 'DatePanel'
})
export default class extends Mixins(ElDatePanel) {
  @Prop()
  private options

  @Prop()
  private currentDate

  public visible = true

  @Watch('currentDate', {
    immediate: true
  })
  private onCurrentDateChange() {
    this.value = new Date(this.currentDate)
  }

  public mounted() {
    this.disabledDate = this.options.disabledDate
    this.cellClassName = this.options.cellClassName
    this.changeCalendar = this.options.changeCalendar
  }
}

</script>
