/* eslint-disable no-param-reassign */
import { defineComponent, ref } from 'vue';
import {
  getEditorEmits,
  getUploadProps,
  useNamespace,
  useFilterAttribute,
} from '@ibiz-template/vue3-util';
import './ibiz-image-select.scss';
import { showImagePreview } from 'vant';
import { UploadEditorController } from '../upload-editor.controller';
import { useVanUpload } from '../use/use-van-upload';

/**
 * 移动端图片控件（单项、直接内容）
 * @primary
 * @description 使用van-uploader组件，用于预览图片。支持编辑器类型包含：`移动端图片控件（单项、直接内容）`
 * @editorparams {name:stoppropagation,parameterType:boolean,description:是否阻止默认点击}
 * @editorparams {name:exportparams,parameterType:string,description:下载参数，图片下载时，用于计算下载路径}
 * @editorparams {name:osscat,parameterType:string,description:用于计算下载路径的OSS参数}
 * @editorparams {"name":"appentitytag","parameterType":"string","description":"在应用启用下载授权时，用于指定当前文件所属实体。该参数值会作为验证下载权限的依据。配置格式为（应用代码名称.实体代码名称），示例：mob.master"}
 * @editorparams {"name":"datafieldtag","parameterType":"string","description":"在应用启用下载授权时，用于指定当前文件所关联的数据属性。完成配置后，将自动从容器数据（涵盖表单数据、表格行数据、面板数据）、上下文环境以及视图参数中获取该属性的实际值，将其作为验证下载权限的依据"}
 * @editorparams {"name":"enablenoaccess","parameterType":"boolean","defaultvalue":"false", "description":"是否启用无权限模式，若启用无权限模式，上传文件夹需拼接'$'字符，也不需要计算下载凭证"}
 * @editorparams {"name":"globaldownloadprifix","parameterType":"boolean","defaultvalue":"false", "description":"是否使用全局文件下载前缀，若启用，则以global作为前缀"}
 * @ignoreprops autoFocus | overflowMode
 * @ignoreemits blur | focus | enter | infoTextChange
 */
export const IBizImageSelect = defineComponent({
  name: 'IBizImageSelect',
  props: getUploadProps<UploadEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('image-select');

    const c = props.controller;

    // 是否阻止默认点击
    let result = c.editorParams?.STOPPROPAGATION !== 'false';
    if (c.editorParams?.stoppropagation) {
      result = c.editorParams.stoppropagation !== 'false';
    }

    // svg图片内容
    const svg = ref('');

    const { files } = useVanUpload(
      props,
      value => {
        emit('change', value);
      },
      c,
    );

    // 预览
    const onPreview = (_file: IData) => {
      showImagePreview({
        images: files.value.map(item => item.url) as string[],
      });
    };

    // 图片点击
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
      svg,
      result,
      onPreview,
      onClick,
    };
  },
  render() {
    return (
      <div class={[this.ns.b()]}>
        <van-uploader
          modelValue={this.files}
          disabled={this.disabled}
          multiple={false}
          accept={this.c.accept}
          max-count={1}
          deletable={false}
          readonly
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
