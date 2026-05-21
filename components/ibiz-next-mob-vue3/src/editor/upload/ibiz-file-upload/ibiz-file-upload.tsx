import { defineComponent } from 'vue';
import {
  getEditorEmits,
  getUploadProps,
  useNamespace,
  useFilterAttribute,
} from '@ibiz-template/vue3-util';
import './ibiz-file-upload.scss';
import { useVanUpload } from '../use/use-van-upload';
import { UploadEditorController } from '../upload-editor.controller';

/**
 * 移动端文件控件
 * @primary
 * @description 使用van-uploader组件，用于对文件进行上传，可限制上传文件类型与数量，并对已上传的文件进行回显。支持编辑器类型包含：`移动端文件控件（单项）`、`移动端文件控件（多项）`
 * @editorparams {name:multiple,parameterType:boolean,description:是否支持多选文件，van-uploader组件的multiple属性}
 * @editorparams {name:accept,parameterType:string,description:允许上传的文件类型，van-uploader组件的accept属性}
 * @editorparams {name:uploadparams,parameterType:string,description:上传参数，图片或文件上传时，用于计算上传路径}
 * @editorparams {name:exportparams,parameterType:string,description:下载参数，图片或文件下载时，用于计算下载路径 }
 * @editorparams {name:osscat,parameterType:string,description:用于计算上传和下载路径的OSS参数}
 * @editorparams {name:showloading,parameterType:boolean,description:是否显示加载动画}
 * @editorparams {"name":"appentitytag","parameterType":"string","description":"在应用启用下载授权时，用于指定当前文件所属实体。该参数值会作为验证下载权限的依据。配置格式为（应用代码名称.实体代码名称），示例：mob.master"}
 * @editorparams {"name":"datafieldtag","parameterType":"string","description":"在应用启用下载授权时，用于指定当前文件所关联的数据属性。完成配置后，将自动从容器数据（涵盖表单数据、表格行数据、面板数据）、上下文环境以及视图参数中获取该属性的实际值，将其作为验证下载权限的依据"}
 * @editorparams {name:readonly,parameterType:boolean,defaultvalue:false,description:设置编辑器是否为只读态}
 * @editorparams {"name":"enablenoaccess","parameterType":"boolean","defaultvalue":"false", "description":"是否启用无权限模式，若启用无权限模式，上传文件夹需拼接'$'字符，也不需要计算下载凭证"}
 * @editorparams {"name":"globaldownloadprifix","parameterType":"boolean","defaultvalue":"false", "description":"是否使用全局文件下载前缀，若启用，则以global作为前缀"}
 * @ignoreprops autoFocus | overflowMode
 * @ignoreemits blur | focus | enter | infoTextChange
 *
 */
export const IBizFileUpload = defineComponent({
  name: 'IBizFileUpload',
  props: getUploadProps<UploadEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('file-upload');
    const c = props.controller;

    const {
      uploadUrl,
      headers,
      files,
      loading,
      onRemove,
      beforeUpload,
      onDownload,
      afterRead,
      limit,
    } = useVanUpload(
      props,
      value => {
        emit('change', value);
      },
      c,
    );

    const getFileSuffix = (name: string): string => {
      // 获取最后一个点的索引位置
      const lastDotIndex = name.lastIndexOf('.');

      if (lastDotIndex === -1) {
        // 如果没有找到点，则表示没有后缀
        return '';
      }
      // 使用substring()方法获取从最后一个点之后的字符串
      const extension = name.substring(lastDotIndex + 1).toLowerCase();
      return extension;
    };

    const getFileName = (filename: string) => {
      // 获取最后一个点的索引位置
      const lastDotIndex = filename.lastIndexOf('.');

      if (lastDotIndex === -1) {
        // 如果没有找到点，则返回原始文件名
        return filename;
      }
      // 使用substring()方法获取点之前的部分作为文件名
      const name = filename.substring(0, lastDotIndex);

      return name;
    };

    const getPreviewImg = (name: string) => {
      const suffix = getFileSuffix(name);
      const type = c.fileTypeMap.get(suffix) || 'unknown';
      return `./assets/img/file/${type}.svg`;
    };

    return {
      ns,
      c,
      uploadUrl,
      headers,
      files,
      loading,
      onRemove,
      beforeUpload,
      onDownload,
      afterRead,
      getFileSuffix,
      getFileName,
      getPreviewImg,
      limit,
    };
  },
  render() {
    return (
      <div
        class={[
          this.ns.b(),
          this.ns.is('single', !this.c.multiple && !!this.files.length),
          this.disabled ? this.ns.m('disabled') : '',
          this.readonly ? this.ns.m('readonly') : '',
        ]}
      >
        <van-uploader
          modelValue={this.files}
          disabled={this.disabled}
          multiple={this.c.multiple}
          accept={this.c.accept}
          max-count={this.limit}
          before-read={this.beforeUpload}
          after-read={this.afterRead}
          before-delete={this.onRemove}
          {...useFilterAttribute(this.$attrs)}
        >
          {{
            default: () => {
              return (
                !this.readonly &&
                !this.disabled && (
                  <van-button
                    loading={this.loading}
                    class={this.ns.b('button')}
                    icon='add-o'
                    type='primary'
                  />
                )
              );
            },
            'preview-cover': (file: IData) => {
              return <div class={this.ns.b('item-cover')}>{file.name}</div>;
            },
          }}
        </van-uploader>
        {this.files.length > 0 && (
          <div class={this.ns.b('preview')}>
            {this.files.map(item => {
              return (
                <div
                  class={this.ns.b('preview-item')}
                  onClick={() => {
                    this.onDownload(item);
                  }}
                >
                  <div class={this.ns.b('preview-item-left')}>
                    <div class={this.ns.b('preview-item-img')}>
                      <img src={this.getPreviewImg(item.name)} alt='' />
                    </div>
                    <div class={this.ns.b('preview-item-text')}>
                      <div class={this.ns.b('preview-item-name')}>
                        {this.getFileName(item.name)}
                      </div>
                      {this.getFileSuffix(item.name) && (
                        <div class={this.ns.b('preview-item-suffix')}>
                          .{this.getFileSuffix(item.name)}
                        </div>
                      )}
                    </div>
                  </div>
                  {!this.readonly && !this.disabled && (
                    <div class={this.ns.b('preview-item-action')}>
                      <van-icon
                        name='cross'
                        onClick={(e: Event) => {
                          e.stopPropagation();
                          this.onRemove(item);
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  },
});
