/* eslint-disable import/no-extraneous-dependencies */
import { defineComponent, nextTick, Ref, ref, watch } from 'vue';
import {
  getHtmlProps,
  getEditorEmits,
  useNamespace,
} from '@ibiz-template/vue3-util';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
import Quill from 'quill';
import { Delta } from 'quill/core';
import { base64ToBlob, CoreConst, getAppCookie } from '@ibiz-template/core';
import { HtmlEditorController } from '../html-editor.controller';
import './quill-editor.scss';

/**
 * 移动端HTML编辑框
 * @primary
 * @description  基于Quill深度定制可扩展的富文本编辑器，集成文件/图片上传、实时预览及样式配置功能，提供完整的富媒体编辑解决方案。支持编辑器类型包含：`移动端HTML编辑框`
 * @editorparams {name:uploadParams,parameterType:IData,defaultvalue:{},description:上传参数}
 * @editorparams {name:exportParams,parameterType:IData,defaultvalue:{},description:下载参数}
 * @editorparams {name:SHOWTOOLBAR,parameterType:boolean,defaultvalue:true,description:显示工具栏}
 * @editorparams {name:VALUEMODE,parameterType:'text' | 'html',defaultvalue:html,description:值模式，暂时只支持html模式}
 * @editorparams {name:IMAGEMODE,parameterType:'base64' | 'file',defaultvalue:'file',description:图片模式}
 * @editorparams {name:MODULES,parameterType:IData,description:quill配置}
 * @editorparams {name:DEFAULTHEIGHT,parameterType:number,defaultvalue:200,description:收缩时的高度}
 * @editorparams {name:SHOWCOLLAPSE,parameterType:boolean,defaultvalue:true,description:是否显示伸缩按钮}
 * @ignoreprops  autoFocus | overflowMode
 * @ignoreemits  infoTextChange | enter
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const IBizQuill: any = defineComponent({
  name: 'IBizQuill',
  props: getHtmlProps<HtmlEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('quill');
    const c: HtmlEditorController = props.controller;

    const editorRef = ref(null);

    const lang = ibiz.i18n.getLang();

    // 编辑器对象
    let quill: Quill | null = null;

    // 请求头
    const headers: Ref<IData> = ref({
      [`${ibiz.env.tokenHeader}Authorization`]: `${
        ibiz.env.tokenPrefix
      }Bearer ${getAppCookie(CoreConst.TOKEN)}`,
    });

    // 上传文件路径
    const uploadUrl: Ref<string> = ref('');

    // 下载文件路径
    const downloadUrl: Ref<string> = ref('');

    // 编辑状态
    const editing: Ref<boolean> = ref(false);

    // 更新中
    const updating: Ref<boolean> = ref(false);

    // 临时数据
    const tempValue: Ref<string> = ref('');

    // 是否完全展开
    const isCollapse: Ref<boolean> = ref(true);

    const getImage = (delta: Delta) => {
      const item = delta.ops.find(x => x.insert && (x.insert as IData).image);
      if (item) {
        return (item.insert as IData).image;
      }
    };

    const getValue = () => {
      if (c.valueMode === 'text') {
        return quill!.getText();
      }
      return quill!.getSemanticHTML();
    };

    // 处理图片上传(文件模式)
    const handleUpload = async (image: string) => {
      const blob = base64ToBlob(image);
      const file = await ibiz.util.file.fileUpload(
        uploadUrl.value,
        blob,
        headers.value,
      );
      const url = downloadUrl.value.replace('%fileId%', file.fileid);
      const value = getValue();
      tempValue.value = value.replace(image, url);
    };

    const init = () => {
      if (!editorRef.value) {
        return;
      }
      const theme = c.showToolbar ? 'snow' : 'bubble';
      quill = new Quill(editorRef.value, {
        theme,
        modules: c.modules,
        readOnly: props.disabled || props.readonly,
        placeholder: c.placeHolder,
      });
      quill.on('text-change', (delta, oldDelta, source) => {
        if (source === 'user') {
          const image = getImage(delta);
          if (image && c.imageMode === 'file') {
            handleUpload(image);
            return;
          }
          tempValue.value = getValue();
        }
      });
      if (c.valueMode === 'text') {
        quill.setText(props.value || '');
      }
    };

    watch(
      () => [props.disabled, props.readonly],
      () => {
        if (!quill) {
          return;
        }
        if (props.disabled || props.readonly) {
          quill.enable(false);
        } else {
          quill.enable();
        }
      },
      { immediate: true },
    );

    // data响应式变更基础路径
    watch(
      () => props.data,
      newVal => {
        if (newVal) {
          const urls = ibiz.util.file.calcFileUpDownUrl(
            c.context,
            c.params,
            newVal,
            c.editorParams,
          );
          uploadUrl.value = urls.uploadUrl;
          downloadUrl.value = urls.downloadUrl;
        }
      },
      { immediate: true, deep: true },
    );

    watch(
      () => props.value,
      () => {
        if (!quill || !props.value) {
          return;
        }
        tempValue.value = props.value;
        if (c.valueMode === 'text') {
          quill.setText(props.value);
        } else {
          updating.value = true;
          nextTick(() => {
            updating.value = false;
          });
        }
      },
      { immediate: true },
    );

    // 展开编辑
    const handleEdit = () => {
      if (!quill) {
        init();
      }
    };

    // 取消编辑
    const handleCancel = () => {
      editing.value = false;
    };

    // 确认编辑
    const handleConfirm = () => {
      emit('change', tempValue.value);
      editing.value = false;
    };

    return {
      ns,
      c,
      lang,
      editing,
      updating,
      editorRef,
      isCollapse,
      handleEdit,
      handleCancel,
      handleConfirm,
    };
  },
  render() {
    return (
      <div
        class={[
          this.ns.b(),
          this.disabled ? this.ns.m('disabled') : '',
          this.readonly ? this.ns.m('readonly') : '',
          this.ns.m(this.lang.toLowerCase()),
        ]}
      >
        {!this.updating && (
          <iBizQuillPreview
            value={this.value}
            controller={this.controller}
            disabled={this.disabled}
            readonly={this.readonly}
            showCollapse={this.c.showCollapse}
            defaultHeight={this.c.defaultHeight}
            isCollapse={this.isCollapse}
            onEdit={() => {
              this.editing = true;
            }}
            onCollapse={(val: boolean) => {
              this.isCollapse = val;
            }}
          />
        )}
        <van-action-sheet
          v-model:show={this.editing}
          teleport='body'
          class={[this.ns.e('popup'), this.ns.m(this.lang.toLowerCase())]}
          onOpened={this.handleEdit}
        >
          <div class={this.ns.e('content')}>
            <div ref='editorRef'>
              {this.controller.valueMode === 'html' ? (
                <div v-html={this.value}></div>
              ) : null}
            </div>
          </div>
          <div class={this.ns.e('footer')}>
            <van-button class={this.ns.e('cancel')} onClick={this.handleCancel}>
              {ibiz.i18n.t('editor.common.cancel')}
            </van-button>
            <van-button
              class={this.ns.e('confirm')}
              onClick={this.handleConfirm}
              type='primary'
            >
              {ibiz.i18n.t('editor.common.confirm')}
            </van-button>
          </div>
        </van-action-sheet>
      </div>
    );
  },
});

export default IBizQuill;
