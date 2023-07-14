<template>
  <div class="detail-wrap">
    <div v-if="checkPermission(['ivs:AdminApp'])" class="detail__buttons">
      <el-button @click="editApp(app)"><svg-icon name="edit" /> 编辑</el-button>
      <el-button @click="deleteApp(app)"><svg-icon name="trash" /> 删除</el-button>
    </div>
    <!-- <el-descriptions title="应用状态" :column="2">
      <el-descriptions-item label="应用状态">
        <status-badge :status="Number(app.appEnabled)" />
        {{ Number(app.appEnabled) ? '已启用' : '未启用' }}
        <el-link v-if="Number(app.appEnabled) && checkPermission(['*'])" @click="startOrStopApp(app, 0)">停用</el-link>
        <el-link v-else-if="checkPermission(['*'])" @click="startOrStopApp(app, 1)">启用</el-link>
      </el-descriptions-item>
    </el-descriptions> -->
    <el-descriptions title="AI算法信息" :column="2">
      <el-descriptions-item label="应用名称">
        {{ app.name }}
      </el-descriptions-item>
      <el-descriptions-item label="算法类型">
        {{ app.algorithm.name }}
      </el-descriptions-item>
      <el-descriptions-item label="截帧频率">
        {{ resourceAiType[app.analyseType] }}
      </el-descriptions-item>
      <el-descriptions-item label="生效时段">
        <span v-for="(item, index) in JSON.parse(app.effectiveTime)" :key="index">{{ `${item.start_time}-${item.end_time}` }}&nbsp;&nbsp;</span>
      </el-descriptions-item>
      <el-descriptions-item v-if="isFaceAlgoCode" label="人脸库">
        {{ faceLib.name || '' }}
      </el-descriptions-item>
      <el-descriptions-item v-if="app.detectItemNames && !isIndustrialDetection" label="检测项">
        {{ app.detectItemNames }}
      </el-descriptions-item>
      <el-descriptions-item label="描述">
        {{ app.description || '-' }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import AppMixin from '../../mixin/app-mixin'
import StatusBadge from '@/components/StatusBadge/index.vue'
import { ResourceAiType } from '@/dics'
import { UserModule } from '@/store/modules/user'

@Component({
  name: 'BasicAppInfo',
  components: {
    StatusBadge
  }
})
export default class extends Mixins(AppMixin) {
  @Prop() private appInfo!: any
  @Prop() private faceLib: any
  private app: any = {}
  private resourceAiType: any = ResourceAiType

  private get isFaceAlgoCode() {
    return ['10001', '10034'].includes(this.app.algorithm.code)
  }

  public created() {
    this.app = this.appInfo
  }

  public get isIndustrialDetection() {
    return UserModule.tags && UserModule.tags.isIndustrialDetection && UserModule.tags.isIndustrialDetection === 'Y'
  }

  /**
   * 删除应用回调
   */
  public onDeleteApp() {
    this.backToAppList()
  }
}
</script>

<style lang='scss' scoped>
  .detail-wrap {
    padding: 5px;

    .detail__buttons {
      border-bottom: 1px solid $borderGrey;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }

    ::v-deep .el-descriptions {
      &__header {
        margin: 10px 0;
      }

      &__title {
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
      }

      &-item__label {
        min-width: 100px;
        text-align: right;
        color: $textGrey;
      }

      .el-link {
        margin-left: 10px;
      }
    }
  }
</style>
