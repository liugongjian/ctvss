<template>
  <RecordTemplate type="viid" />
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import RecordTemplate from './RecordTemplate.vue'

@Component({
  name: 'RecordTemplateViid',
  components: {
    RecordTemplate
  }
})
export default class extends Vue {

}
</script>
