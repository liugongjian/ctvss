<template>
  <div class="tags__wrap">
    <div
      v-for="(tag, index) in tags"
      :key="index"
      class="tags__item"
    >
      <div class="tags__item__col">
        <el-input v-model="tag.key" placeholder="键" @change="onChange" />
      </div>
      <div class="tags__item__col">
        <el-input v-model="tag.value" placeholder="值" @change="onChange" />
      </div>
      <div class="tags__item__col">
        <svg-icon class="tags__item__remove" name="trash" @click="removeTag(index)" />
      </div>
    </div>
    <el-button class="tags__add" @click="addTag">+ 添加标签</el-button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

@Component({
  name: 'Tags'
})
export default class extends Vue {
  @Prop()
  private value?: string

  private tags: any = []

  @Watch('value', {
    immediate: true
  })
  private onValueChange(value: string) {
    const tags: any = []
    const splitString = value?.split(',')
    splitString?.forEach((tagString: any) => {
      const spliteTag = tagString.split(':')
      spliteTag[0] && tags.push({
        key: spliteTag[0],
        value: spliteTag[1]
      })
    })
    if (!tags.length) {
      tags.push({
        key: '',
        value: ''
      })
    }
    this.tags = tags
  }

  private addTag() {
    this.tags.push({
      key: '',
      value: ''
    })
  }

  private removeTag(index: number) {
    this.tags.splice(index, 1)
    this.onChange()
  }

  private onChange() {
    const stringList: Array<string> = []
    this.tags.forEach((tag: any) => {
      tag.key && stringList.push(`${tag.key}:${tag.value}`)
    })
    this.$emit('input', stringList.join(','))
  }
}
</script>

<style lang="scss" scoped>
  .tags {
    &__item {
      display: flex;
      margin-bottom: 10px;

      &__col {
        margin-right: 10px;
      }

      &__remove {
        cursor: pointer;
        &:hover {
          color: $primary;
        }
      }
    }
    &__add {
      width: 100%;
    }
  }
</style>
