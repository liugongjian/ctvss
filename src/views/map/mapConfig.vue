<template>
  <div class="mapConfig-container">
    <el-form ref="mapform" :model="form" label-width="240px" :rules="rules">
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入地图名称" />
      </el-form-item>
      <el-form-item label="中心点经度" prop="longitude">
        <el-input v-model="form.longitude" placeholder="请输入地图中心点经度" />
      </el-form-item>
      <el-form-item label="中心点纬度" prop="latitude">
        <el-input v-model="form.latitude" placeholder="请输入地图中心点纬度" />
      </el-form-item>
      <el-form-item prop="zoom">
        <template slot="label">
          <span>默认缩放比例
            <el-tooltip :content="tips.zoom">
              <svg-icon name="help" />
            </el-tooltip>
          </span>
        </template>
        <div class="block">
          <el-slider v-model="form.zoom" :min="3" :max="20" />
          <span class="zoomdesc">{{ zoomDesc }}</span>
        </div>
      </el-form-item>
      <el-form-item label="启用鹰眼地图">
        <el-switch v-model="form.eagle" />
      </el-form-item>
      <el-form-item label="启用3D地图">
        <el-switch v-model="form.dimension" />
      </el-form-item>
      <el-form-item label="显示点位名称">
        <template slot="label">
          显示点位名称:
          <el-popover
            placement="top-start"
            width="400"
            trigger="hover"
            :open-delay="300"
            content="在点位图标下显示设备名称"
          >
            <svg-icon slot="reference" class="form-question" name="help" />
          </el-popover>
        </template>
        <el-switch v-model="form.marker" />
      </el-form-item>
      <el-form-item label="启用蒙版">
        <template slot="label">
          是否启用蒙版:
          <el-popover
            placement="top-start"
            width="400"
            trigger="hover"
            :open-delay="300"
            content="启用蒙版后多边形区域会变为镂空风格"
          >
            <svg-icon slot="reference" class="form-question" name="help" />
          </el-popover>
        </template>
        <el-switch v-model="form.mask" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script  lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { validateIsLng, validateIsLat } from './utils/validate'
import { createMap, modifyMap } from '@/api/map'

@Component({
  name: 'MapConfig'
})
export default class MapConfig extends Vue {
  @Prop()
  private info

  private tips = {
    zoom: '设置地图的默认缩放比例，表示每厘米对应实际的距离',
    mask: '启用蒙版后多边形区域会变为镂空风格',
    marker: '在点位图标下显示设备名称'
  }
  public form: any = {
    mapId: '',
    name: '',
    longitude: '',
    latitude: '',
    zoom: 12,
    mask: false, // 是否启用蒙版
    eagle: false, // 是否启用鹰眼
    dimension: false, // 是否启用3D
    marker: false // 是否显示点位
  }
  private get zoomDesc() {
    const map = {
      20: '1:10m',
      19: '1:10m',
      18: '1:25m',
      17: '1:50m',
      16: '1:100m',
      15: '1:200m',
      14: '1:500m',
      13: '1:1km',
      12: '1:2km',
      11: '1:5km',
      10: '1:10km',
      9: '1:20km',
      8: '1:30km',
      7: '1:50km',
      6: '1:100km',
      5: '1:200km',
      4: '1:500km',
      3: '1:1000km',
      2: '1:1000km'
    }
    const zoomGrade = Math.round(this.form.zoom)
    return map[zoomGrade]
  }

  private rules = {
    name: [
      { validator: this.validateName, trigger: 'blur' }
    ],
    longitude: [
      { validator: this.validatelng, trigger: 'blur' }
    ],
    latitude: [
      { validator: this.validatelat, trigger: 'blur' }
    ]
  }

  private validateName(rule: any, value: string, callback: Function) {
    const val = value.trim()
    if (!val.trim()) {
      callback(new Error('地图名称不能为空'))
    } else if (val.length > 64) {
      callback(new Error('地图名称过长，请输入64字以内名称'))
    } else if (/^[\s]|[\s]$/.test(value)) {
      callback(new Error('不能以空格作为名称的首尾。'))
    } else {
      callback()
    }
  }
  private validatelng(rule: any, value: string, callback: Function) {
    if (!validateIsLng(value) && !value) {
      callback(new Error('经度坐标格式错误'))
    } else {
      callback()
    }
  }
  private validatelat(rule: any, value: string, callback: Function) {
    if (!validateIsLat(value) && value) {
      callback(new Error('纬度坐标格式错误'))
    } else {
      callback()
    }
  }

  private cancel() {
    this.$emit('close')
  }

  private async submit() {
    this.$refs.mapform.validate(async(valid: any) => {
      if (!valid) return
      let newMap
      try {
        const map = {
          name: this.form.name,
          longitude: this.form.longitude || '116.397428',
          latitude: this.form.latitude || '39.90923',
          zoom: this.form.zoom,
          mask: this.form.mask ? 'Y' : 'N',
          eagle: this.form.eagle ? 'Y' : 'N',
          dimension: this.form.dimension ? 'Y' : 'N',
          marker: this.form.marker ? 'Y' : 'N'
        }
        if (this.form.status === 'add') {
          console.log('addMap: ', map)
          const res = await createMap(map)
          const mapId = res.mapId
          newMap = { ...map, mapId }
        } else {
          newMap = {
            mapId: this.form.mapId,
            ...map
          }
          console.log('modifyMap: ', newMap)
          await modifyMap(newMap)
        }
        this.$emit('changeMap', { type: this.form.status, mapinfo: newMap })
        this.$emit('close')
      } catch (e) {
        this.$alertError(e.message)
      }
    })
  }

  private mounted() {
    this.form = { ...this.info }
  }
}
</script>

<style lang='scss' scoped>
.mapConfig-container {
  background-color: #fff;
  position: absolute;
  z-index: 10;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 20px;
}
.el-form {
  .el-input {
    width: 250px;
  }

  ::v-deep .el-form-item__content {
    line-height: 33px !important;
  }

  ::v-deep .el-form-item--medium {
    margin-top: 20px;
  }
}
</style>
