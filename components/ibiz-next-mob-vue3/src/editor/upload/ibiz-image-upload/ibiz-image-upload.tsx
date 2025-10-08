/* eslint-disable no-param-reassign */
import { defineComponent } from 'vue';
import {
  getEditorEmits,
  getUploadProps,
  useNamespace,
} from '@ibiz-template/vue3-util';
import './ibiz-image-upload.scss';
import { showImagePreview } from 'vant';
import { useVanUpload } from '../use/use-van-upload';
import { UploadEditorController } from '../upload-editor.controller';

/**
 * 移动端图片控件
 * @primary
 * @description 使用van-uploader组件，用于对指定的图片文件类型进行上传。支持编辑器类型包含：`移动端图片控件（单项）`、`移动端图片控件（多项）`
 * @editorparams {name:multiple,parameterType:boolean,description:是否支持多选文件，van-uploader组件的multiple属性}
 * @editorparams {name:accept,parameterType:string,description:允许上传的文件类型，van-uploader组件的multiple属性}
 * @editorparams {name:STOPPROPAGATION,parameterType:boolean,description:是否阻止默认点击}
 * @editorparams {name:uploadParams,parameterType:IData,description:上传参数}
 * @editorparams {name:exportParams,parameterType:IData,description:下载参数}
 * @ignoreprops autoFocus | overflowMode
 * @ignoreemits blur | focus | enter | infoTextChange
 */
export const IBizImageUpload = defineComponent({
  name: 'IBizImageUpload',
  props: getUploadProps<UploadEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('image-upload');

    const c = props.controller;

    // 是否阻止默认点击
    const result = c.editorParams?.STOPPROPAGATION !== 'false';

    const {
      uploadUrl,
      headers,
      files,
      onRemove,
      beforeUpload,
      afterRead,
      limit,
      onDownload,
    } = useVanUpload(
      props,
      value => {
        emit('change', value);
      },
      c,
    );

    // 预览
    const onPreview = (_file: IData) => {
      const index = files.value.findIndex(item => item.id === _file.id);
      showImagePreview({
        images: files.value.map(item => item.url) as string[],
        startPosition: index,
      });
    };

    const onClick = (file: IData, event: MouseEvent) => {
      if (result) {
        event.stopPropagation();
        onPreview(file);
      }
    };

    return {
      ns,
      c,
      files,
      limit,
      headers,
      uploadUrl,
      result,
      beforeUpload,
      onRemove,
      onPreview,
      afterRead,
      onDownload,
      onClick,
    };
  },
  render() {
    // 编辑态展示
    return (
      <div
        class={[
          this.ns.b(),
          this.disabled ? this.ns.m('disabled') : '',
          this.readonly ? this.ns.m('readonly') : '',
        ]}
      >
        <van-uploader
          modelValue={this.files}
          disabled={this.disabled}
          readonly={this.readonly}
          multiple={this.c.multiple}
          accept={this.c.accept}
          max-count={this.limit}
          deletable={!this.disabled && !this.readonly}
          before-read={this.beforeUpload}
          after-read={this.afterRead}
          before-delete={this.onRemove}
          preview-full-image={this.result}
          {...this.$attrs}
        >
          {{
            'preview-cover': (file: IData) => {
              return (
                <div
                  class={this.ns.b('item-cover')}
                  onClick={(event: MouseEvent) => this.onClick(file, event)}
                >
                  <img src={file.url}></img>
                </div>
              );
            },
          }}
        </van-uploader>
      </div>
    );
  },
});
