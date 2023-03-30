<template>
  <div v-if="deviceId && isLoaded" class="config-container">
    <service-info v-if="deviceType !== deviceTypeEnum.Platform" :device-id="deviceId" :device="device" />
    <!-- <resource-template-info v-if="!isIbox" :device-id="deviceId" :device="device" />
    <record-template-info v-if="!isIbox" :device-id="deviceId" /> -->
    <callback-template-info :device-id="deviceId" />
    <alert-template-info v-if="!isIbox && inProtocol === InVideoProtocolEnum.Gb28181" :device-id="deviceId" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import ServiceInfo from '@vss/device/components/DeviceDetail/DeviceConfig/ServiceInfo.vue'
import ResourceTemplateInfo from '@vss/device/components/DeviceDetail/DeviceConfig/ResourceTemplateInfo.vue' 
import RecordTemplateInfo from '@vss/device/components/DeviceDetail/DeviceConfig/RecordTemplateInfo.vue' 
import CallbackTemplateInfo from '@vss/device/components/DeviceDetail/DeviceConfig/CallbackTemplateInfo.vue' 
import AlertTemplateInfo from '@vss/device/components/DeviceDetail/DeviceConfig/AlertTemplateInfo.vue'
import detailMixin from '@vss/device/mixin/deviceMixin'
import { InVideoProtocolEnum } from '@vss/device/enums/index'

@Component({
  name: 'DeviceConfig',
  components: {
    ServiceInfo,
    ResourceTemplateInfo,
    RecordTemplateInfo,
    CallbackTemplateInfo,
    AlertTemplateInfo
  }
})
export default class extends Mixins(detailMixin) {
  private InVideoProtocolEnum = InVideoProtocolEnum

  private isLoaded = false

  public async created() {
    await this.getDevice()
    this.isLoaded = true
  }
}
</script>
<style lang="scss" scoped>
  .config-container {
    ::v-deep {
      .detail__section {
        padding-bottom: $padding-medium;

        .detail__title {
          position: relative;
          padding-left: 15px;
          margin: 10px 0;
          font-size: 16px;
          font-weight: bold;

          &:before {
            content: ' ';
            display: block;
            position: absolute;
            left: 0;
            top: 0;
            background: $primary;
            width: 6px;
            height: 18px;
          }

          .detail__buttons {
            right: 10px;
          }

          .el-link {
            font-size: 14px;
          }
        }

        .el-card .el-card__header {
          position: relative;

          .el-button {
            position: absolute;
            right: 10px;
            top: 0;
          }
        }

        .el-descriptions-item__label {
          min-width: 100px;
        }

        .el-table {
          border: 1px solid $borderGrey;
        }

        .detail__table-row {
          padding-right: 15px;
          flex: 1;
        }
      }

      .disable-btn-box {
        display: inline-block;
        padding: 0 10px;
      }
    }
  }

</style>
