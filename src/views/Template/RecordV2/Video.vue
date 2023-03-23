<template>
  <RecordTemplate type="video" />
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import RecordTemplate from './RecordTemplate.vue'

@Component({
  name: 'RecordTemplateVideo',
  components: {
    RecordTemplate
  }
})
export default class extends Vue {

}
</script>
