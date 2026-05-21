/* eslint-disable no-param-reassign */
import { defineComponent } from 'vue';
import {
  getEditorEmits,
  getUploadProps,
  useNamespace,
  useFilterAttribute,
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
 * @editorparams {name:accept,parameterType:string,description:允许上传的文件类型，van-uploader组件的accept属性}
 * @editorparams {name:stoppropagation,parameterType:boolean,description:是否阻止默认点击}
 * @editorparams {name:uploadparams,parameterType:string,description:上传参数，图片上传时，用于计算上传路径}
 * @editorparams {name:exportparams,parameterType:string,description:下载参数，图片下载时，用于计算下载路径}
 * @editorparams {name:osscat,parameterType:string,description:用于计算上传和下载路径的OSS参数}
 * @editorparams {name:imgcompresslimit,parameterType:number,defaultvalue:1024,description:图片压缩范围（超过该范围进行压缩，单位kb）}
 * @editorparams {name:imgcompressquality,parameterType:number,defaultvalue:0,description:图片压缩质量（0-1，为0时不压缩，默认为0）}
 * @editorparams {name:imgcompressmaxwidth,parameterType:number,defaultvalue:1280,description:压缩图片最大宽度，默认为1280px}
 * @editorparams {"name":"appentitytag","parameterType":"string","description":"在应用启用下载授权时，用于指定当前文件所属实体。该参数值会作为验证下载权限的依据。配置格式为（应用代码名称.实体代码名称），示例：mob.master"}
 * @editorparams {"name":"datafieldtag","parameterType":"string","description":"在应用启用下载授权时，用于指定当前文件所关联的数据属性。完成配置后，将自动从容器数据（涵盖表单数据、表格行数据、面板数据）、上下文环境以及视图参数中获取该属性的实际值，将其作为验证下载权限的依据"}
 * @editorparams {name:readonly,parameterType:boolean,defaultvalue:false,description:设置编辑器是否为只读态}
 * @editorparams {"name":"enablenoaccess","parameterType":"boolean","defaultvalue":"false", "description":"是否启用无权限模式，若启用无权限模式，上传文件夹需拼接'$'字符，也不需要计算下载凭证"}
 * @editorparams {"name":"globaldownloadprifix","parameterType":"boolean","defaultvalue":"false", "description":"是否使用全局文件下载前缀，若启用，则以global作为前缀"}
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
    let result = c.editorParams?.STOPPROPAGATION !== 'false';
    if (c.editorParams?.stoppropagation) {
      result = c.editorParams.stoppropagation !== 'false';
    }

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
          {...useFilterAttribute(this.$attrs)}
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
