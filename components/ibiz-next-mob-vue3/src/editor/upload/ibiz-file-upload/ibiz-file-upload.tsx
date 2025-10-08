import { defineComponent } from 'vue';
import {
  getEditorEmits,
  getUploadProps,
  useNamespace,
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
 * @editorparams {name:uploadParams,parameterType:IData,description:上传参数}
 * @editorparams {name:exportParams,parameterType:IData,description:下载参数}
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
          {...this.$attrs}
        >
          {{
            default: () => {
              return (
                !this.readonly &&
                !this.disabled && (
                  <van-button
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
