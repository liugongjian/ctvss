<template>
  <div>
    <el-form
      ref="viidForm"
      :rules="rules"
      :model="viidForm"
      label-position="right"
      label-width="150px"
    >
      <el-form-item label="接入协议:" prop="inProtocol">
        <el-radio v-for="(value, key) in inProtocolType" :key="key" v-model="viidForm.inProtocol" :label="key">{{ value }}</el-radio>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { InProtocolType } from '../dicts/index'

@Component({
  name: 'ViidCreateForm'
})
export default class extends Vue {
  private inProtocolType = InProtocolType
  private viidForm = {
    inProtocol: 'gb28181'
  }
  rules = []
}
</script>
