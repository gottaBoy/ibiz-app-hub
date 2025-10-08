/* eslint-disable no-param-reassign */
import { EditFormController, IControlProvider } from '@ibiz-template/runtime';
import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import { IDEEditForm } from '@ibiz/model-core';
import { debounce } from 'lodash-es';
import { defineComponent, PropType, reactive, ref, Ref, watch } from 'vue';
import './edit-form.scss';

export const EditFormControl: ReturnType<typeof defineComponent> =
  defineComponent({
    name: 'IBizEditFormControl',
    props: {
      /**
       * @description 表单模型数据
       */
      modelData: { type: Object as PropType<IDEEditForm>, required: true },
      /**
       * @description 应用上下文对象
       */
      context: { type: Object as PropType<IContext>, required: true },
      /**
       * @description 视图参数对象
       * @default {}
       */
      params: { type: Object as PropType<IParams>, default: () => ({}) },
      /**
       * @description 部件适配器
       */
      provider: { type: Object as PropType<IControlProvider> },
      /**
       * @description 是否是简单模式，即直接传入数据，不加载数据
       */
      isSimple: { type: Boolean, required: false },
      /**
       * @description 简单模式下传入的数据
       */
      data: { type: Object as PropType<IData>, required: false },
      /**
       * @description 是否默认加载数据
       * @default true
       */
      loadDefault: { type: Boolean, default: true },
      /**
       * @description 简单模式下传入的数据索引
       */
      simpleDataIndex: { type: Number, required: false },
      /**
       * @description 多数据部件表单模式下传入的表单索引
       */
      mdCtrlFormIndex: { type: Number, required: false },
    },
    setup(props) {
      const c = useControlController(
        (...args) => new EditFormController(...args),
        { excludePropsKeys: ['data'] },
      );

      const ns = useNamespace(`control-edit-form`);

      const filter = ref('');

      // 所有启用了锚点的表单项
      const anchorList: Ref<IData[]> = ref([]);

      // 锚点目标滚动容器
      const anchorTargetRef = ref<IData>();

      if (props.isSimple) {
        if (props.simpleDataIndex || props.simpleDataIndex === 0) {
          c.setSimpleDataIndex(props.simpleDataIndex);
        }
        c.evt.on('onMounted', () => {
          // 第一次data直接赋值，后面默认加载会走load
          c.setSimpleData(props.data || {});
        });
        watch(
          () => props.data,
          newVal => {
            const changeVal = newVal || {};
            // 找有没有不一致的属性
            const find = Object.keys(c.data).find(key => {
              return changeVal[key] !== c.data[key];
            });
            // 内外部数据不一致时，只能是外部修改了，这是更新数据并重走load
            if (find) {
              c.setSimpleData(changeVal);
            }
          },
          { deep: true },
        );
      }

      // 多数据部件表单模式下传入的数据索引直接设置到state中
      if (props.mdCtrlFormIndex || props.mdCtrlFormIndex === 0) {
        c.setMdCtrlFormIndex(props.mdCtrlFormIndex);
      }

      c.evt.on('onCreated', () => {
        // 表单成员state响应式
        const keys = Object.keys(c.details);
        keys.forEach(key => {
          const detail = c.details[key];
          detail.state = reactive(detail.state);
        });
        anchorList.value = c.anchorData;
      });

      const calcNavBarConfig = () => {
        const {
          navBarPos,
          navBarSysCss,
          navBarWidth,
          navBarStyle,
          navbarHeight,
        } = c.model;
        return {
          navBarPos,
          navBarSysCss,
          navBarWidth,
          navBarStyle,
          navbarHeight,
        };
      };

      const handleInput = debounce(
        (val: string) => {
          c.filterDetail(val);
        },
        300,
        { leading: true },
      );

      return {
        c,
        ns,
        filter,
        anchorList,
        anchorTargetRef,
        handleInput,
        calcNavBarConfig,
      };
    },

    render() {
      const { showFormNavBar, enableItemFilter } = this.c.model;
      const content = (
        <div class={[this.ns.b(), this.ns.is('item-filter', enableItemFilter)]}>
          {enableItemFilter && (
            <el-input
              clearable={true}
              v-model={this.filter}
              onInput={this.handleInput}
              class={this.ns.e('quick-search')}
              placeholder={ibiz.i18n.t('app.search')}
            ></el-input>
          )}
          <iBizFormControl ref='anchorTargetRef' controller={this.c}>
            {{ ...this.$slots }}
          </iBizFormControl>
        </div>
      );
      if (showFormNavBar) {
        return (
          <iBizAnchorContainer
            anchorList={this.anchorList.filter(
              (item: IData) => item.pageId === this.c.state.activeTab,
            )}
            anchorTargetEle={this.anchorTargetRef}
            navBarConfig={this.calcNavBarConfig()}
          >
            {content}
          </iBizAnchorContainer>
        );
      }
      return content;
    },
  });
