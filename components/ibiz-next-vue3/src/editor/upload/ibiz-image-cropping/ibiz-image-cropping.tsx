/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-param-reassign */
import { computed, defineComponent, nextTick, Ref, ref } from 'vue';
import {
  useNamespace,
  getEditorEmits,
  getUploadProps,
  useFocusAndBlur,
  useAutoFocusBlur,
} from '@ibiz-template/vue3-util';
import { useIViewUpload } from '../use/use-iview-upload';
import { UploadEditorController } from '../upload-editor.controller';
import './ibiz-image-cropping.scss';

/**
 * 图片裁剪上传
 *
 * @description 使用el-upload，el-image-viewer组件封装，用于对图片进行裁剪处理后再执行上传操作。基于`图片控件`编辑器进行扩展，编辑器样式代码名称为：PICTURE_CROPPING
 * @primary
 * @editorparams {"name":"cropwidth","parameterType":"number","defaultvalue":400,"description":"设置图片截取区域的宽度"}
 * @editorparams {"name":"cropheight","parameterType":"number","defaultvalue":200,"description":"设置图片截取区域的高度"}
 * @editorparams {"name":"autopreview","parameterType":"boolean","defaultvalue":false,"description":"当输入参数 `readonly` 为 true 并且该参数为 true 时。加载完图片后将自动调整图片大小达到预览态，且鼠标移入后不显示图片处理工具栏"}
 * @editorparams {"name":"accept","parameterType":"string","description":"el-upload组件的accept属性"}
 * @editorparams {"name":"uploadparams","parameterType":"string","description":"上传参数，图片上传时，用于计算上传路径"}
 * @editorparams {"name":"exportparams","parameterType":"string","description":"下载参数，图片下载时，用于计算下载路径"}
 * @editorparams {"name":"osscat","parameterType":"string","description":"用于计算上传和下载路径的OSS参数"}
 * @editorparams {"name":"infomap","parameterType":"string","description":"上传文件信息的映射规则字符串，用于将上传成功后返回的文件数据转换为保存数据所需格式。格式为'源键:目标键;源键2:目标键2'。示例：映射规则（'filesize:size;fileext:ext'），源对象（{filesize:'10000', fileext:'.gif'}），转换结果（{size:'10000', ext:'.gif'}）"}
 * @editorparams {"name":"readonly","parameterType":"boolean","defaultvalue":false,"description":"设置编辑器是否为只读态"}
 * @editorparams {"name":"appentitytag","parameterType":"string","description":"在应用启用下载授权时，用于指定当前文件所属实体。该参数值会作为验证下载权限的依据。配置格式为（应用代码名称.实体代码名称），示例：web.master"}
 * @editorparams {"name":"datafieldtag","parameterType":"string","description":"在应用启用下载授权时，用于指定当前文件所关联的数据属性。完成配置后，将自动从容器数据（涵盖表单数据、表格行数据、面板数据）、上下文环境以及视图参数中获取该属性的实际值，将其作为验证下载权限的依据"}
 * @ignoreprops autoFocus | overflowMode
 * @ignoreemits blur | focus | enter | infoTextChange
 */
export const IBizImageCropping = defineComponent({
  name: 'IBizImageCropping',
  props: getUploadProps<UploadEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('image-cropping-upload');

    const c = props.controller;

    const { useInFocusAndBlur, useInValueChange } = useAutoFocusBlur(
      props,
      emit,
    );

    const {
      uploadUrl,
      headers,
      files,
      limit,
      onDownload,
      onError,
      onRemove,
      onSuccess,
      beforeUpload,
    } = useIViewUpload(
      props,
      value => {
        emit('change', value);
        useInValueChange();
      },
      c,
    );

    const dialogImageUrl = ref<string[]>([]);
    const dialogImageUrlIndex = ref<number>(0);
    const dialogVisible = ref<boolean>(false);

    // 允许上传标识
    const uploadTag = ref(false);

    // 文件上传组件Ref
    const imageUpload = ref();

    const cropRect: IData = {};
    if (c.editorParams?.cropWidth) {
      Object.assign(cropRect, {
        cropareaWidth: Number(c.editorParams.cropWidth),
      });
    }
    if (c.editorParams?.cropwidth) {
      Object.assign(cropRect, {
        cropareaWidth: Number(c.editorParams.cropwidth),
      });
    }
    if (c.editorParams?.cropHeight) {
      Object.assign(cropRect, {
        cropareaHeight: Number(c.editorParams.cropHeight),
      });
    }
    if (c.editorParams?.cropheight) {
      Object.assign(cropRect, {
        cropareaHeight: Number(c.editorParams.cropheight),
      });
    }

    // 本地准备裁剪上传的文件
    const tempFileList: Ref<IData | undefined> = ref();

    // 显示裁剪框
    const cropVisible: Ref<boolean> = ref(false);

    const onDialogVisibleChange = (value: boolean) => {
      dialogVisible.value = value;
    };

    // 预览
    const onPreview = (file: IData) => {
      dialogImageUrl.value = [];
      files.value.forEach(i => {
        if (i.base64) {
          (dialogImageUrl.value as string[]).push(i.base64);
        } else if (i.url) {
          (dialogImageUrl.value as string[]).push(i.url);
        }
      });
      dialogImageUrlIndex.value = files.value.findIndex(
        item => item.url === file.url,
      );
      dialogVisible.value = true;
    };

    // 不显示上传图标
    const noUploadIcon = computed(() => {
      return limit.value === 1 && files.value.length === 1;
    });

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

    // 聚焦失焦事件
    const { componentRef } = useFocusAndBlur(
      () => emit('focus'),
      () => useInFocusAndBlur(),
    );

    // 文件读取状态改变
    const onChange = (file: IData) => {
      if (file.status === 'ready' && !uploadTag.value) {
        tempFileList.value = file;
        uploadTag.value = true;
        cropVisible.value = true;
      }
    };

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

    // 截取完成
    const cropChange = (url: string) => {
      if (!url) {
        uploadTag.value = false;
        cropVisible.value = false;
        ibiz.message.info(ibiz.i18n.t('editor.upload.cancelUpload'));
        return;
      }
      const blob = dataURLtoBlob(url);
      const _tempFile = new File([blob], 'cropimg.png', {
        type: blob.type,
      });
      if (_tempFile) {
        nextTick(() => {
          imageUpload.value.handleRemove(tempFileList.value);
          imageUpload.value.handleStart(_tempFile);
          tempFileList.value = undefined;
          imageUpload.value.submit();
          uploadTag.value = false;
          cropVisible.value = false;
        });
      }
    };

    const cropDialogClose = () => {
      if (tempFileList.value) {
        ibiz.message.info(ibiz.i18n.t('editor.upload.cancelUpload'));
        imageUpload.value.handleRemove(tempFileList.value);
      }
      uploadTag.value = false;
    };

    return {
      ns,
      c,
      files,
      limit,
      headers,
      uploadUrl,
      dialogImageUrl,
      dialogVisible,
      noUploadIcon,
      beforeUpload,
      onSuccess,
      onError,
      onRemove,
      onDownload,
      onDialogVisibleChange,
      onPreview,
      componentRef,
      showFormDefaultContent,
      dialogImageUrlIndex,
      cropVisible,
      tempFileList,
      imageUpload,
      cropRect,
      onChange,
      cropDialogClose,
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
          this.readonly && this.c.autoPreview && this.ns.m('autosize'),
          this.ns.is('show-default', this.showFormDefaultContent),
        ]}
        ref='componentRef'
      >
        <div class={this.ns.e('image-upload-list')}>
          {this.files.map(item => (
            <div key={item.id} class={this.ns.e('list-item')}>
              <img src={item.base64 ? item.base64 : item.url} />
              <div class={this.ns.e('list-item-cover')}>
                <ion-icon
                  class={this.ns.e('preview-icon')}
                  onClick={() => this.onPreview(item)}
                  name='search'
                ></ion-icon>
                <ion-icon
                  class={this.ns.e('download-icon')}
                  onClick={() => this.onDownload(item)}
                  name='download'
                ></ion-icon>
                <ion-icon
                  class={this.ns.e('remove-icon')}
                  onClick={() => this.onRemove(item)}
                  name='remove'
                ></ion-icon>
              </div>
            </div>
          ))}
        </div>
        <el-upload
          ref='imageUpload'
          class={[this.ns.b('icon'), this.ns.is('not-show', this.noUploadIcon)]}
          file-list={this.files}
          action={this.uploadUrl}
          headers={this.headers}
          disabled={this.disabled}
          multiple={false}
          limit={this.limit}
          show-file-list={false}
          accept={this.c.accept}
          list-type={'picture-card'}
          auto-upload={false}
          onChange={this.onChange}
          before-upload={this.beforeUpload}
          onSuccess={this.onSuccess}
          onError={this.onError}
          onRemove={this.onRemove}
          onPreview={this.onDownload}
          {...this.$attrs}
        >
          <ion-icon
            name='add-outline'
            class={this.ns.e('image-upload-add')}
          ></ion-icon>
        </el-upload>
        <el-dialog
          v-model={this.cropVisible}
          title={ibiz.i18n.t('editor.upload.cropImg')}
          class={this.ns.e('upload-dialog')}
          onClosed={this.cropDialogClose}
          destroy-on-close
          width={640}
        >
          {{
            default: () => {
              return (
                <iBizCropping
                  img={this.tempFileList}
                  onChange={this.cropChange}
                  {...this.cropRect}
                ></iBizCropping>
              );
            },
          }}
        </el-dialog>
        {this.dialogVisible ? (
          <el-image-viewer
            onClose={() => this.onDialogVisibleChange(false)}
            url-list={this.dialogImageUrl}
            hide-on-click-modal={true}
            close-on-press-escape={true}
            teleported
            z-index={9999}
            initial-index={this.dialogImageUrlIndex}
            {...this.$attrs}
          ></el-image-viewer>
        ) : null}
      </div>
    );
  },
});
