<template>
  <div class="app-container">
    <div v-loading="loading.info" class="detail-wrap">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="基本信息" name="info">
          <div v-if="info">
            <div class="detail__buttons">
              <el-button @click="goSuperior"><svg-icon name="superior" /> 返回上级</el-button>
              <el-button v-if="(!isNVR && info.parentDeviceId === '-1') && checkPermission(['AdminDevice'])" @click="moveDir"><svg-icon name="move" /> 移动至</el-button>
              <el-button v-if="!isVGroup && checkPermission(['AdminDevice'])" @click="edit"><svg-icon name="edit" /> 编辑</el-button>
              <el-button v-if="!isAutoCreated && checkPermission(['AdminDevice']) && !isVGroup" @click="deleteDevice(info)"><svg-icon name="trash" /> 删除</el-button>
            </div>
            <!--状态信息-->
            <div class="detail__section">
              <div class="detail__title">状态信息</div>
              <el-descriptions :column="2">
                <el-descriptions-item label="设备状态">
                  <status-badge :status="info.isOnline === '1' ? 'on' : 'off'" />
                  {{ isOnline[info.isOnline] || '-' }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
            <!--设备信息-->
            <div class="detail__section">
              <div class="detail__title">设备信息</div>
              <el-descriptions :column="2">
                <!--通用信息-->
                <el-descriptions-item label="设备ID">
                  {{ info.deviceId }}
                </el-descriptions-item>
                <el-descriptions-item label="设备名称">
                  {{ info.deviceName }}
                </el-descriptions-item>
                <el-descriptions-item label="设备类型">
                  {{ deviceGa1400Type[info.deviceType] }}
                </el-descriptions-item>
                <el-descriptions-item label="GA1400账号">
                  {{ info.userName }}
                </el-descriptions-item>
                <el-descriptions-item v-if="['ape'].includes(info.deviceType)" label="设备地址">
                  {{ address ? address + `（行政区代码：${info.placeCode}）` : '-' }}
                </el-descriptions-item>
                <el-descriptions-item v-if="['ape'].includes(info.deviceType)" label="经纬度">
                  {{ `${info.deviceLongitude || '-'} : ${info.deviceLatitude || '-'}` }}
                </el-descriptions-item>
                <el-descriptions-item label="设备IP">
                  {{ info.deviceIp || info.deviceIpv6 || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="设备端口">
                  {{ info.devicePort || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="设备描述">
                  {{ info.description || '-' }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <move-dir v-if="dialog.moveDir" :in-protocol="inProtocol" :device="info" :is-batch="false" @on-close="closeDialog('moveDir', ...arguments)" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import detailMixin from '../mixin/detailMixin'
import { getGa1400Device } from '@/api/device'
import { DeviceGa1400Type } from '@/dics'
import { allRegionList } from '@/assets/region/region'

@Component({
  name: 'DeviceGa1400Detail'
})
export default class extends Mixins(detailMixin) {
  private deviceGa1400Type = DeviceGa1400Type

  public async detailInit() {
    if (this.$route.query.tab) {
      this.activeName = this.$route.query.tab.toString()
    } else {
      this.activeName = 'info'
    }
    await this.getDevice()
    this.inProtocol !== 'ga1400' && await this.getDeviceResources()
  }

  /**
   * 获取region
   */
  public get address() {
    let address = ''
    let gbRegion = this.info!.placeCode
    const list = [
      parseInt(gbRegion!.substring(0, 2)),
      parseInt(gbRegion!.substring(0, 4)),
      parseInt(gbRegion!.substring(0, 6))
    ]
    let region0 = allRegionList.find((item0: any) => {
      return item0.code === list[0]
    })
    if (region0) {
      address += region0.name
      let region1 = region0.children.find((item1: any) => {
        return item1.code === list[1]
      })
      if (region1) {
        address += '/' + region1.name
        let region2 = region1.children.find((item2: any) => {
          return item2.code === list[2]
        })
        if (region2) {
          address += '/' + region2.name
        } else {
          address += '/' + region1.children[0].name
        }
      } else {
        address += '/' + region0.children[0].name + '/' + region0.children[0].children[0].name
      }
    }
    return address
  }

  public async getDevice() {
    try {
      this.loading.info = true
      this.info = await getGa1400Device({
        deviceId: this.deviceId,
        inProtocol: this.inProtocol
      })
    } catch (e) {
      console.error(e)
    } finally {
      this.loading.info = false
    }
  }

  public async mounted() {
    this.getGroup()
  }
}
</script>
<style lang="scss" scoped>
  .detail-wrap {
    ::v-deep .el-descriptions-item__label {
      min-width: 130px;
    }
  }
</style>
