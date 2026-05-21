/* eslint-disable array-callback-return */
import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import { computed, defineComponent, PropType, ref, watch } from 'vue';
import { IDEList } from '@ibiz/model-core';
import { IControlProvider } from '@ibiz-template/runtime';
import './tagged-wall.scss';
import { $NormalSort, $RandomSplit } from '../util';
import { CustomTag } from './tag';
import { TaggedWallController } from './tagged-wall.controller';

export const TaggedWall = defineComponent({
  name: 'TaggedWall',
  component: [CustomTag],
  props: {
    modelData: { type: Object as PropType<IDEList>, required: true },
    context: { type: Object as PropType<IContext>, required: true },
    params: { type: Object as PropType<IParams>, default: () => ({}) },
    provider: { type: Object as PropType<IControlProvider> },
    /**
     * 部件行数据默认激活模式
     * - 0 不激活
     * - 1 单击激活
     * - 2 双击激活(默认值)
     *
     * @type {(number | 0 | 1 | 2)}
     */
    mdctrlActiveMode: { type: Number, default: undefined },

    /**
     * 是否为单选
     * - true 单选
     * - false 多选
     *
     * @type {(Boolean)}
     */
    singleSelect: { type: Boolean, default: undefined },
    isSimple: { type: Boolean, required: false },
    loadDefault: { type: Boolean, default: true },
  },
  setup() {
    const c = useControlController(
      (...args) => new TaggedWallController(...args),
    );
    const ns = useNamespace(`tagged-wall`);
    const list = ref<number[]>([]);
    const tagList = ref<IData[]>([]);
    const tags = computed(() => {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      const arr = $RandomSplit(tagList.value.length, 7);
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      list.value = $NormalSort(arr); // 获取数据结构
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      const temp = tagList.value
        .sort(() => {
          // 重新随机排序
          return Math.random() > 0.5 ? -1 : 1;
        })
        .concat();
      return list.value.map((v, _k) => {
        // 根据list生成数据结构
        return temp.splice(0, v);
      });
    });

    watch(
      () => c.state.items,
      () => {
        tagList.value = c.state.items;
      },
    );

    return {
      c,
      ns,
      tags,
      tagList,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('tag-body')}>
          <div class={this.ns.e('tag-body-tags')}>
            {this.tags.map((item, index) => {
              return (
                <div key={index} class={this.ns.e('tag-body-tags-li')}>
                  {item.map(tag => {
                    return (
                      <CustomTag
                        key={tag.id}
                        tname={tag.name}
                        controller={this.c}
                      ></CustomTag>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
});
