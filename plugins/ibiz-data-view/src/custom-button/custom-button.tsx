import { useNamespace } from '@ibiz-template/vue3-util';
import { IHtmlItem, IPanelRawItem, ITextItem } from '@ibiz/model-core';
import {
  PropType,
  Ref,
  computed,
  defineComponent,
  h,
  ref,
  resolveComponent,
  watch,
} from 'vue';
import {
  CustomButton1,
  CustomButton2,
  CustomButton3,
  CustomButton4,
  CustomButton5,
  CustomButton6,
} from './component';
import { CustomBtnController } from './custom-button.controller';
import './custom-button.scss';

export const CustomButton = defineComponent({
  name: 'CustomButton',
  components: {
    CustomButton1,
    CustomButton2,
    CustomButton3,
    CustomButton4,
    CustomButton5,
    CustomButton6,
  },
  props: {
    modelData: {
      type: Object as PropType<IPanelRawItem>,
      required: true,
    },
    controller: {
      type: CustomBtnController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('panel-button');
    const c = props.controller;

    const { rawItem } = props.modelData;

    const tempStyle = ref('');
    const svgStyle = ref({});

    const svgColor = ref('lightblue');
    const svgBorderColor = ref();
    const svgShape = ref('CustomButton5');
    const svgBgColor = ref('');
    const svgBgOpacity = ref(0.6);

    // 传入内容
    const content: Ref<string | number | undefined> = ref('');

    if (rawItem && rawItem.cssStyle) {
      tempStyle.value = rawItem.cssStyle;
    }

    if (rawItem && rawItem.rawItemParams) {
      rawItem.rawItemParams.forEach((item: IData) => {
        if (item.key === 'BUTTONNAME') {
          svgShape.value = item.value;
        } else if (item.key === 'BORDERCOLOR') {
          svgBorderColor.value = item.value;
        } else if (item.key === 'COLOR') {
          svgColor.value = item.value;
        } else if (item.key === 'BGCOLOR') {
          svgBgColor.value = item.value;
        }
      });
    }

    // 类名控制
    const classArr = computed(() => {
      const { id } = props.modelData;
      const result: Array<string | false> = [ns.b(), ns.m(id)];
      result.push(...props.controller.containerClass);
      return result;
    });

    Object.assign(svgStyle.value, {
      [ns.cssVarBlockName('svg-border-color')]: svgBorderColor.value,
      [ns.cssVarBlockName('svg-color')]: svgColor.value,
      [ns.cssVarBlockName('svg-bg-color')]: svgBgColor.value,
      [ns.cssVarBlockName('svg-bg-opacity')]: svgBgOpacity.value,
    });
    console.log('svgStyle', ns, svgStyle.value);

    watch(
      () => c.data,
      async newVal => {
        if (newVal) {
          const rawItemModel = c.model.rawItem;
          if (!rawItemModel) {
            return;
          }
          let rawItemContent;
          const obj = { ...newVal };
          if (rawItemModel.contentType === 'RAW') {
            rawItemContent = (rawItemModel as ITextItem).caption!;
          } else if (rawItemModel.contentType === 'HTML') {
            rawItemContent = (rawItemModel as IHtmlItem).content!;
          }
          if (rawItemContent && rawItemModel.templateMode) {
            rawItemContent = await ibiz.util.hbs.render(
              rawItemContent.replace('//n', '\n'),
              Object.assign(obj, { data: { ...newVal } }),
            );
          }
          content.value = rawItemContent;
        }
      },
      {
        immediate: true,
      },
    );

    return {
      ns,
      classArr,
      tempStyle,
      content,
      svgShape,
      svgStyle,
    };
  },
  render() {
    // 动态控制显示
    if (!this.controller.state.visible) {
      return;
    }
    const buttonName = resolveComponent(this.svgShape);
    return (
      <div
        class={this.classArr}
        style={this.tempStyle}
        onClick={(event: MouseEvent) => {
          this.controller.onClick(event);
        }}
      >
        <div class={this.ns.b('custon-btn')} style={this.svgStyle}>
          {buttonName && h(buttonName)}
          <iBizRawItem
            class={this.ns.e('raw-item')}
            rawItem={this.modelData}
            content={this.content}
          ></iBizRawItem>
        </div>
      </div>
    );
  },
});
