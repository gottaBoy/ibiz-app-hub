/* eslint-disable no-param-reassign */
import { computed, defineComponent, Ref, ref } from 'vue';
import {
  getEditorEmits,
  getUploadProps,
  useNamespace,
} from '@ibiz-template/vue3-util';
import './ibiz-image-cropping.scss';
import { showImagePreview } from 'vant';
import { useVanUpload } from '../use/use-van-upload';
import { UploadEditorController } from '../upload-editor.controller';

/**
 * 图片裁剪上传（扩展）
 * @primary
 * @description 使用van-uploader组件和van-popup组件，用于对指定的图片进行裁剪，并根据裁剪内容生成新的图片后将其进行上传。基于`移动端图片控件（单项）`编辑器扩展，编辑器样式代码名称为：CROPPING
 * @editorparams {name:multiple,parameterType:boolean,description:是否支持多选文件}
 * @editorparams {name:accept,parameterType:string,description:允许上传的文件类型}
 * @editorparams {name:STOPPROPAGATION,parameterType:boolean,description:是否阻止默认点击}
 * @editorparams {name:cropWidth,parameterType:number,description:裁剪宽度}
 * @editorparams {name:cropHeight,parameterType:number,description:裁剪高度}
 * @editorparams {name:uploadParams,parameterType:IData,description:上传参数}
 * @editorparams {name:exportParams,parameterType:IData,description:下载参数}
 * @ignoreprops autoFocus | overflowMode
 * @ignoreemits blur | focus | enter | infoTextChange
 */
export const IBizImageCropping = defineComponent({
  name: 'IBizImageCropping',
  props: getUploadProps<UploadEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('image-upload-cropping');

    const c = props.controller;

    // 裁剪框是否显示
    const show = ref(false);

    // 待上传的文件
    const tempFile: Ref<IData | undefined> = ref();

    // 是否阻止默认点击
    const result = c.editorParams?.STOPPROPAGATION !== 'false';

    const cropRect: IData = {};

    if (c.editorParams?.cropWidth) {
      Object.assign(cropRect, {
        cropareaWidth: Number(c.editorParams.cropWidth),
      });
    }
    if (c.editorParams?.cropHeight) {
      Object.assign(cropRect, {
        cropareaHeight: Number(c.editorParams.cropHeight),
      });
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

    const cropReadedFile = (file: IData) => {
      tempFile.value = file;
      show.value = true;
    };

    const cropImgUrl = computed(() => {
      if (tempFile.value) {
        return tempFile.value.content;
      }
      return '';
    });

    const dataURLtoBlob = (dataURL: string) => {
      const byteString = atob(dataURL.split(',')[1]);
      const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const intArray = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i++) {
        intArray[i] = byteString.charCodeAt(i);
      }
      return new Blob([arrayBuffer], { type: mimeString });
    };

    const cropChange = (url: string) => {
      show.value = false;
      if (!url) {
        ibiz.message.info(ibiz.i18n.t('editor.upload.cancelUpload'));
        return;
      }
      const blob = dataURLtoBlob(url);
      const _tempFile = new File([blob], 'cropimg.png', {
        type: blob.type,
      });
      if (_tempFile && tempFile.value) {
        tempFile.value.file = _tempFile;
        afterRead(tempFile.value);
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
      cropReadedFile,
      onDownload,
      onClick,
      show,
      tempFile,
      cropImgUrl,
      cropRect,
      cropChange,
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
          ref='uploadRef'
          modelValue={this.files}
          disabled={this.disabled}
          readonly={this.readonly}
          multiple={false}
          accept={this.c.accept}
          max-count={this.limit}
          deletable={!this.disabled && !this.readonly}
          auto-upload={false}
          before-read={this.beforeUpload}
          after-read={this.cropReadedFile}
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
        <van-popup v-model:show={this.show} class={this.ns.e('crop-popup')}>
          <iBizCropping
            url={this.cropImgUrl}
            onChange={this.cropChange}
            {...this.cropRect}
          ></iBizCropping>
        </van-popup>
      </div>
    );
  },
});
