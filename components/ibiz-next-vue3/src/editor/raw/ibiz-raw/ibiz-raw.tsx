import { computed, defineComponent, Ref, ref, watch } from 'vue';
import {
  getRawProps,
  useNamespace,
  getEditorEmits,
} from '@ibiz-template/vue3-util';
import { RawEditorController } from '../raw-editor.controller';
import './ibiz-raw.scss';

/**
 * 直接内容
 *
 * @description 用于绘制配置的直接内容，如HTML内容、视频内容、图片内容等。支持编辑器类型包含：`直接内容`
 * @primary
 * @editorparams {name:contenttype,parameterType:'IMAGE' | 'TEXT' | 'RAW' | 'HEADING1' | 'HEADING2' | 'HEADING3' | 'HEADING4' | 'HEADING5' | 'HEADING6' | 'PARAGRAPH' | 'HTML' | 'VIDEO' | 'DIVIDER' | 'INFO' | 'WARNING' | 'ERROR' | 'MARKDOWN' | 'PLACEHOLDER',defaultvalue:'TEXT',description:定义组件展示的内容类型。包含`IMAGE`（图片）、`TEXT`（文本）、`RAW`（直接内容）、`HEADING1`-`HEADING6`（各级标题）、`PARAGRAPH`（段落）、`HTML`（Html内容）、`VIDEO`（视频）、`DIVIDER`（分割线）、`INFO`（常规提示）、`WARNING`（警告提示）、`ERROR`（错误提示）、`MARKDOWN`（Markdown内容）、`PLACEHOLDER`（占位）}
 * @editorparams {name:template,parameterType:string,description:配置的handlerBars模板内容，用于将组件输入参数中的value值解析并转换为HTML内容，实现动态内容的渲染}
 * @editorparams {"name":"chunkview","parameterType":"string", "description":"切片视图，用于定义打开目标切片视图"}
 * @editorparams {"name":"chunkentity","parameterType":"string", "description":"切片实体，用于打开切片视图数据主键key"}
 * @ignoreprops autoFocus | overflowMode
 * @ignoreemits change | blur | focus | enter | infoTextChange
 */
export const IBizRaw = defineComponent({
  name: 'IBizRaw',
  props: getRawProps<RawEditorController>(),
  emits: getEditorEmits(),
  setup(props) {
    const ns = useNamespace('raw');
    const c = props.controller;
    const editorModel = c.model;
    // 传入内容
    const content: Ref<string | number | undefined> = ref('');

    const enableOverFlow = computed(() => {
      return !!c.model.editorHeight;
    });

    const chunkView = c.editorParams.chunkview;
    const chunkEntity = c.editorParams.chunkentity;

    // 类型
    let type = 'TEXT';
    // handlerBars模版
    let template = '';
    if (editorModel.contentType) {
      type = editorModel.contentType;
    }
    if (editorModel.editorParams && editorModel.editorParams.contenttype) {
      type = editorModel.editorParams.contenttype;
    }
    if (editorModel.editorParams && editorModel.editorParams.template) {
      template = editorModel.editorParams.template.replace(/\/\/n/g, '\n');
    }
    if (editorModel.editorParams && editorModel.editorParams.TEMPLATE) {
      template = editorModel.editorParams.TEMPLATE.replace(/\/\/n/g, '\n');
    }
    // TODO 等接口有了放开
    // if (editorModel.template) {
    //   template = editorModel.template.replaceAll('//n', '\n');
    // }

    // 是否显示表单默认内容
    const showFormDefaultContent = computed(() => {
      if (
        props.controlParams &&
        props.controlParams.editmode === 'hover' &&
        !props.readonly
      ) {
        return true;
      }
      return false;
    });

    watch(
      () => props.value,
      async (newVal, oldVal) => {
        if (newVal !== oldVal) {
          if (
            typeof newVal === 'string' ||
            typeof newVal === 'number' ||
            !newVal
          ) {
            content.value = newVal;
          }
          if (template && newVal) {
            let obj = newVal as IData;
            if (typeof newVal === 'string') {
              try {
                obj = JSON.parse(newVal);
              } catch (error) {
                ibiz.log.error('JSON字符串转换错误');
              }
            }
            if (!Array.isArray(obj)) {
              // 不是数组，合并父数据
              Object.assign(obj, { data: { ...props.data } });
            }
            ibiz.log.debug('模板内容：', template);
            ibiz.log.debug('模板编译对象：', obj);
            content.value = await ibiz.util.hbs.render(template, obj);
          }
        }
      },
      {
        immediate: true,
      },
    );

    return {
      ns,
      type,
      content,
      template,
      chunkView,
      chunkEntity,
      enableOverFlow,
      showFormDefaultContent,
    };
  },
  render() {
    return (
      <div
        class={[
          this.ns.b(),
          this.ns.is('overflow', this.enableOverFlow),
          this.disabled ? this.ns.m('disabled') : '',
          this.readonly ? this.ns.m('readonly') : '',
          this.ns.is('show-default', this.showFormDefaultContent),
        ]}
      >
        {this.content && (
          <iBizRawItem
            data={this.data}
            type={this.type}
            content={this.content}
            chunkView={this.chunkView}
            chunkEntity={this.chunkEntity}
            context={this.controller.context}
            ctrl={this.controller.ctrl}
            view={this.controller.view}
            class={this.ns.b('content')}
          ></iBizRawItem>
        )}
      </div>
    );
  },
});
