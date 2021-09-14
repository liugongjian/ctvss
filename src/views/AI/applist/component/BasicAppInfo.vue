<template>
  <div class="detail-wrap">
    <div class="detail__buttons">
      <el-button @click="editApp(appInfo)"><svg-icon name="edit" /> 编辑</el-button>
      <el-button @click="deleteApp(appInfo)"><svg-icon name="trash" /> 删除</el-button>
    </div>
    <el-descriptions title="应用状态" :column="2">
      <el-descriptions-item label="应用状态">
        <status-badge :status="Number(appInfo.appEnabled)" />
        {{ Number(appInfo.appEnabled) ? '已启用' : '未启用' }}
        <el-link v-if="Number(appInfo.appEnabled) && checkPermission(['*'])" @click="startOrStopApp(appInfo, 0)">停用</el-link>
        <el-link v-else-if="checkPermission(['*'])" @click="startOrStopApp(appInfo, 1)">启用</el-link>
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="AI算法信息" :column="2">
      <el-descriptions-item label="应用名称">
        {{ appInfo.name }}
      </el-descriptions-item>
      <el-descriptions-item label="算法类型">
        {{ appInfo.algorithm.name }}
      </el-descriptions-item>
      <el-descriptions-item label="截帧频率">
        {{ resourceAiType[appInfo.analyseType] }}
      </el-descriptions-item>
      <el-descriptions-item label="生效时段">
        <span v-for="(item, index) in JSON.parse(appInfo.effectiveTime)" :key="index">{{ item.starttime }} - {{ item.endtime }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="人脸库">
        TODO!!
      </el-descriptions-item>
      <el-descriptions-item label="描述">
        {{ appInfo.description || '-' }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import AppMixin from '../../mixin/app-mixin'
import StatusBadge from '@/components/StatusBadge/index.vue'
import { ResourceAiType } from '@/dics'

@Component({
  name: 'BasicAppInfo',
  components: {
    StatusBadge
  }
})
export default class extends Mixins(AppMixin) {
  @Prop() private appInfo!: any
  private resourceAiType: any = ResourceAiType

  /**
   * 刷新数据
   */
  public refresh() {
  }

  /**
   * 删除应用回调
   */
  public onDeleteApp() {
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
        &::before {
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
