<template>
  <div class="ibox-list-create">
    <el-button class="ibox-create-btn">
      添加/编辑设备
    </el-button>
    <div class="process" />
    <el-steps :active="active" finish-status="success" simple>
      <el-step title="设备配置" />
      <el-step title="接入配置" />
    </el-steps>
    <div v-if="active===1" class="ibox-create">
      <el-form ref="form" :model="formData" label-width="130px" :rules="rules">
        <el-form-item label="设备名称" prop="deviceName">
          <el-input v-model="formData.deviceName" />
        </el-form-item>
        <el-form-item label="设备分类" prop="deviceType">
          <el-select v-model="formData.deviceType" placeholder="请选择活动区域">
            <el-option v-for="item in deviceType" :key="item.label" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="厂商" prop="region">
          <el-select v-model="formData.deviceVendor" placeholder="请选择活动区域">
            <el-option label="区域一" value="shanghai" />
            <el-option label="区域二" value="beijing" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备地址" prop="region">
          <el-select v-model="formData.region" placeholder="请选择活动区域">
            <el-option label="区域一" value="shanghai" />
            <el-option label="区域二" value="beijing" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属行业" prop="region">
          <el-select v-model="formData.region" placeholder="请选择活动区域">
            <el-option label="区域一" value="shanghai" />
            <el-option label="区域二" value="beijing" />
          </el-select>
        </el-form-item>
        <el-form-item label="经纬度:" prop="longlat">
          <el-input v-model="formData.deviceLongitude" class="longlat-input" /> :
          <el-input v-model="formData.deviceLatitude" class="longlat-input" />
        </el-form-item>
        <el-form-item label="活动形式" prop="desc">
          <el-input v-model="formData.description" type="textarea" />
        </el-form-item>
      </el-form>
      <el-button style="margin-top: 12px;" @click="next">下一步</el-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'Create',
  components: {
  }
})

export default class CreateIBox extends Vue {
  public active = 1

  public formData = {
    deviceName: '',
    deviceType: '',
    deviceVendor: '',
    description: '',
    deviceLongitude: '',
    deviceLatitude: '',
    region: ''
  }

  public rules = {
    deviceName: [
      { required: true, message: '请输入设备名称', trigger: 'blur' },
      { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
    ],
    deviceType: [
      { required: true, message: '请选择设备分类', trigger: 'change' }
    ]
  }

  public deviceType = [
    {
      label: 'IPC',
      value: 'IPC'
    }, {
      label: 'NVR',
      value: 'NVR'
    }, {
      label: 'platform',
      value: 'platform'
    }
  ]

  async mounted() {
    // await this.getIBoxList()
  }

  public next() {
    if (this.active++ > 1) this.active = 0
  }
}
</script>
  <style lang="scss" scoped>
.ibox-list-create {
  width: 100%;
  height: calc(100% - 20px);
  padding: 0 20px 10px 0;
  overflow: auto;

  .ibox-create-btn {
    margin: 10px 0;
  }

  .ibox-create {
    width: 60%;
  }

  .process {
    padding: 20px 30px;
    border-bottom: 1px solid $borderGrey;

    .el-steps--simple {
      width: 400px;
      background: none;
      padding: 0;

      ::v-deep {
        .el-step.is-simple .el-step__head {
          padding-right: 15px;
        }

        .el-step.is-simple .el-step__arrow {
          margin-right: 15px;
          align-self: center;
          height: 0;
          border-bottom: 2px solid $primary;

          &:before,
          &:after {
            content: none;
          }
        }

        .el-step__title {
          flex: 0 0 80px;
          color: #000;
        }

        .el-step__icon {
          width: 30px;
          height: 30px;
          font-size: 16px;
          font-weight: bold;
        }

        .is-success {
          .el-step__icon {
            color: $primary;
            border-color: $primary;
          }
        }

        .is-process {
          .el-step__icon {
            background: $primary;
            color: #fff;
            border-color: $primary;
          }
        }

        .is-wait,
        .is-finish {
          color: $textGrey;

          .el-step__icon {
            border-color: $textGrey;
          }
        }

        .is-finish {
          .el-step__icon {
            background: #bbb;
            color: #fff;
            border-color: #bbb;
          }
        }
      }
    }
  }
}
  </style>
