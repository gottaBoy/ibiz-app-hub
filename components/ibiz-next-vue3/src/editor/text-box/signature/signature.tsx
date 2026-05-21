import { defineComponent, ref, watch, Ref, computed, nextTick } from 'vue';
import {
  getEditorEmits,
  getInputProps,
  useNamespace,
} from '@ibiz-template/vue3-util';
import { base64ToBlob, CoreConst, getAppCookie } from '@ibiz-template/core';
import { TextBoxEditorController } from '../text-box-editor.controller';
import './signature.scss';

/**
 * 电子签名（扩展）
 *
 * @description 用于在业务系统中采集、展示和保存用户签名信息。基于`文本框`编辑器进行扩展，编辑器样式代码名称为：SIGNATURE
 * @primary
 * @editorparams {"name":"mode","parameterType":"'img' | 'file'","defaultvalue":"'img'","description":"指定签名的保存格式。当值为'img'时，直接保存为Base64格式的图片URL（以data:协议开头）；当值为'file'时，系统会先将签名图片上传至服务器，再保存服务器返回的文件元信息（包含文件ID和名称）"}
 * @editorparams {"name":"buttons","parameterType":"string","defaultvalue":"'\\[{\"label\":\"撤销\",\"type\":\"undo\"},{\"label\":\"重写\",\"type\":\"rewrite\"},{\"label\":\"确认\",\"type\":\"confirm\",\"buttonType\":\"primary\"}\\]'","description":"配置签名的操作按钮。JSON 字符串数组中每个对象表示一个按钮：label为按钮显示文本；type为按钮触发的事件类型（undo-撤销上一步，rewrite-清空重写，confirm-确认保存）；buttonType可选，指定按钮样式（支持primary/success/default/danger/warning）。示例：仅显示确认按钮可配置为\\[{\"label\":\"确认\",\"type\":\"confirm\",\"buttonType\":\"primary\"}\\]"}
 * @editorparams {name:dotsize,parameterType:number,defaultvalue:0,description:点的大小（单位：像素）。控制点击画布时生成的点的尺寸，0表示根据线条宽度自动计算点的大小}
 * @editorparams {name:minwidth,parameterType:number,defaultvalue:2,description:线条最小宽度（单位：像素）。控制签名线条的最细宽度，绘制速度越快，线条越接近此值}
 * @editorparams {name:maxwidth,parameterType:number,defaultvalue:2,description:线条最大宽度（单位：像素）。控制签名线条的最粗宽度，绘制速度越慢，线条越接近此值}
 * @editorparams {"name":"pencolor","parameterType":"string","defaultvalue":"'black'","description":"画笔颜色。签名轨迹的颜色，可接受CSS颜色格式（如#ff0000）"}
 * @editorparams {name:velocityfilterweight,parameterType:number,defaultvalue:0.7,description:线条粗细速度敏感度。用于平滑处理绘制速度的计算，影响线条粗细随速度的变化幅度。值越接近1，当前速度对线条粗细影响越大；值越小，线条过渡越平滑}
 * @editorparams {name:mindistance,parameterType:number,defaultvalue:5,description:绘制点最小记录间距（单位：像素）。当点击画布生成的点与后续绘制线的距离小于此值时，不记录后续绘制的线，用于减少冗余数据并优化绘制流畅度}
 * @editorparams {"name":"backgroundcolor","parameterType":"string","defaultvalue":"'rgba(0,0,0,0)'","description":"画布背景色。签名画布的背景颜色，导出图片时会包含此背景，可接受CSS颜色格式"}
 * @editorparams {name:throttle,parameterType:number,defaultvalue:16,description:事件节流时间（单位：毫秒）。限制绘制事件的触发频率，避免高频操作导致性能问题}
 * @editorparams {"name":"readonly","parameterType":"boolean","defaultvalue":false,"description":"设置编辑器是否为只读态"}
 * @editorparams {"name":"appentitytag","parameterType":"string","description":"在应用启用下载授权时，用于指定当前文件所属实体。该参数值会作为验证下载权限的依据。配置格式为（应用代码名称.实体代码名称），示例：web.master"}
 * @editorparams {"name":"datafieldtag","parameterType":"string","description":"在应用启用下载授权时，用于指定当前文件所关联的数据属性。完成配置后，将自动从容器数据（涵盖表单数据、表格行数据、面板数据）、上下文环境以及视图参数中获取该属性的实际值，将其作为验证下载权限的依据"}
 * @editorparams {"name":"exportparams","parameterType":"string","description":"下载参数，图片或文件下载时，用于计算下载路径"}
 * @editorparams {"name":"osscat","parameterType":"string","description":"用于计算上传和下载路径的OSS参数"}
 * @editorparams {"name":"enablenoaccess","parameterType":"boolean","defaultvalue":"false", "description":"是否启用无权限模式，若启用无权限模式，上传文件夹需拼接'$'字符，也不需要计算下载凭证"}
 * @editorparams {"name":"globaldownloadprifix","parameterType":"boolean","defaultvalue":"false", "description":"是否使用全局文件下载前缀，若启用，则以global作为前缀"}
 * @ignoreprops autoFocus | overflowMode
 * @ignoreemits blur | focus | enter | infoTextChange
 */
export const IBizSignature = defineComponent({
  name: 'IBizSignature',
  props: getInputProps<TextBoxEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('signature');
    const c = props.controller;
    const editorModel = c.model;

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
    const signatureRef = ref();
    const fullScreen = ref(false);
    const currentDataURL = ref('');
    const currentVal = ref<string>('');

    // 是否启用无权限
    let enableNoAccess = c?.editorParams?.enablenoaccess === 'true';

    // 是否使用全局文件下载前缀
    let globalDownloadPrifix: boolean = false;
    if (c?.editorParams.globaldownloadprifix) {
      globalDownloadPrifix = c.editorParams.globaldownloadprifix === 'true';
    } else {
      globalDownloadPrifix = ibiz.config.common.globalDownloadPrifix;
    }
    let saveMode: 'img' | 'file' = 'img';
    // 按钮配置数组
    let buttons = [
      {
        label: ibiz.i18n.t('editor.signature.undo'),
        type: 'undo',
      },
      {
        label: ibiz.i18n.t('editor.signature.rewrite'),
        type: 'rewrite',
      },
      {
        label: ibiz.i18n.t('editor.signature.confirm'),
        type: 'confirm',
        buttonType: 'primary',
      },
    ];

    if (editorModel.editorParams) {
      if (editorModel.editorParams.mode) {
        saveMode = editorModel.editorParams.mode;
      }
      if (editorModel.editorParams.buttons) {
        try {
          buttons = JSON.parse(editorModel.editorParams.buttons);
        } catch (error) {
          ibiz.log.error(error);
        }
      }
      if (editorModel.editorParams.enablenoaccess) {
        enableNoAccess = editorModel.editorParams.enablenoaccess === 'true';
      }
    }

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

    /**
     * 重置画布，根据当前数据重新加载签名
     * @return {*}
     */
    const restCavans = (): void => {
      signatureRef.value?.updateSignaturePad(() => {
        nextTick(() => {
          if (currentDataURL.value) {
            signatureRef.value?.signaturePad.fromDataURL(currentDataURL.value);
          } else {
            signatureRef.value?.signaturePad.clear();
          }
        });
      });
    };

    /**
     * 处理当前值，加载初始签名数据
     * @return {*}
     */
    const handleCurrentVal = async (): Promise<void> => {
      if (currentVal.value) {
        ibiz.loading.showRedirect();
        if (saveMode === 'img') {
          currentDataURL.value = currentVal.value;
        } else if (downloadUrl.value) {
          const fileData = JSON.parse(currentVal.value)[0];
          const _url = downloadUrl.value.replace('%fileId%', fileData.id);
          try {
            const editorParams: IData = {
              ...c.editorParams,
              enableNoAccess,
              globalDownloadPrifix,
            };
            if (editorParams.exportparams) {
              editorParams.exportParams = JSON.parse(editorParams.exportparams);
            }
            const fileBlob = await ibiz.util.file.requestFile(
              _url,
              undefined,
              {
                context: c.context,
                params: c.params,
                data: props.data,
                file: { fileId: fileData.id },
                extraParams: editorParams,
                downloadTicketParams: c.downloadTicketParams,
              },
              undefined,
              enableNoAccess,
            );
            // 通过文件流创建下载链接
            const dataUrl =
              await signatureRef.value?.signaturePad.blobToDataURL(
                fileBlob as Blob,
              );
            currentDataURL.value = dataUrl;
          } catch (error) {
            ibiz.log.error(error);
          }
        }
        restCavans();
        signatureRef.value?.signaturePad.loadImage(currentDataURL.value, () => {
          ibiz.loading.hideRedirect();
        });
      }
    };

    // data响应式变更基础路径
    watch(
      () => props.data,
      newVal => {
        if (newVal) {
          const editorParams: IData = {
            ...c.editorParams,
            enableNoAccess,
            globalDownloadPrifix,
          };
          if (editorParams.uploadparams) {
            editorParams.uploadParams = JSON.parse(editorParams.uploadparams);
          }
          const urls = ibiz.util.file.calcFileUpDownUrl(
            c.context,
            c.params,
            newVal,
            editorParams,
          );
          uploadUrl.value = urls.uploadUrl;
          downloadUrl.value = urls.downloadUrl;
        }
      },
      { immediate: true, deep: true },
    );

    watch(
      () => props.value,
      async (newVal, oldVal) => {
        if (newVal !== oldVal) {
          if (!newVal) {
            currentVal.value = '';
          } else {
            // 适配保存模式
            currentVal.value = `${newVal || ''}`;
          }
          await handleCurrentVal();
        }
      },
      { immediate: true },
    );

    /**
     * 处理抛值
     * @param {string} _value
     */
    const handleEmit = (_value: string | null): void => {
      emit('change', _value);
    };

    /**
     * 获取文件类型
     * @param {string} dataURL
     * @return {*}  {BlobPropertyBag}
     */
    const getFileType = (dataURL: string): BlobPropertyBag => {
      const parts = dataURL.split(',');
      const mime = parts[0].split(':')[1].split(';')[0];
      return { type: mime };
    };

    /**
     * 处理图片上传 (文件模式)
     * @param {string} dataURL
     * @return {*}
     */
    const handleUpload = async (dataURL: string): Promise<IData> => {
      const { type } = getFileType(dataURL);
      const blob = base64ToBlob(dataURL);
      const fileName = `signature_${Date.now()}.png`;
      const file = new File([blob], fileName, { type });
      const fileInfo = await ibiz.util.file.fileUpload(
        uploadUrl.value,
        file,
        headers.value,
      );

      return fileInfo;
    };

    /**
     * 处理移除签名事件
     * @return {*}
     */
    const handleRemove = (): void => {
      signatureRef.value?.signaturePad.clear();
      currentDataURL.value = '';
      handleEmit(null);
    };

    /**
     * 处理文件变化事件
     * @param {string} dataURL
     */
    const handleFileChange = async (dataURL: string): Promise<void> => {
      const file = await handleUpload(dataURL);
      handleEmit(JSON.stringify([{ name: file.name, id: file.id }]));
    };

    /**
     * 处理确认事件
     * @return {*}
     */
    const handleConfirm = (): void => {
      fullScreen.value = false;

      // 当为空白，或者未进行过签名时，不保存
      if (!signatureRef.value?.signaturePad.isRedrawn()) return;

      // 当为空白时，直接删除
      if (signatureRef.value?.signaturePad.isEmpty()) {
        handleRemove();
        return;
      }

      const dataURL = signatureRef.value?.signaturePad.toDataURL();

      if (dataURL === currentDataURL.value) return;

      currentDataURL.value = dataURL;
      switch (saveMode) {
        case 'file':
          handleFileChange(dataURL);
          break;
        case 'img':
        default:
          handleEmit(dataURL);
          break;
      }
    };

    /**
     * 处理按钮点击事件
     * @param {string} _type
     */
    const handleButtonClick = (_type: string): void => {
      switch (_type) {
        case 'undo':
          signatureRef.value?.signaturePad.undoLastStep();
          break;
        case 'rewrite':
          signatureRef.value?.signaturePad.clear();
          break;
        case 'confirm':
          handleConfirm();
          break;
        default:
          break;
      }
    };

    return {
      c,
      ns,
      signatureRef,
      fullScreen,
      currentDataURL,
      buttons,
      showFormDefaultContent,
      handleButtonClick,
    };
  },
  render() {
    return (
      <div
        class={[
          this.ns.b(),
          this.disabled ? this.ns.m('disabled') : '',
          this.readonly ? this.ns.m('readonly') : '',
          this.ns.is('show-default', this.showFormDefaultContent),
        ]}
      >
        <iBizSignaturePad
          ref='signatureRef'
          class={this.ns.e('pad')}
          options={{
            ...this.c.model.editorParams,
            ...this.$attrs,
          }}
        ></iBizSignaturePad>

        {!this.readonly && (
          <div class={this.ns.e('toolbar')}>
            {this.buttons.map(_btn => {
              return (
                <el-button
                  disabled={this.disabled}
                  type={
                    (_btn.buttonType && _btn.buttonType.toLowerCase()) ||
                    'default'
                  }
                  onClick={() => this.handleButtonClick(_btn.type)}
                >
                  {_btn.label}
                </el-button>
              );
            })}
          </div>
        )}
      </div>
    );
  },
});
