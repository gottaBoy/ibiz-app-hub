import { PropType, defineComponent, ref } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { ControlVO, GridFieldColumnController } from '@ibiz-template/runtime';
import { getFileType, useFilesParse } from './file-util';
import './attachment-column.scss';

export const AttachmentColumn = defineComponent({
  name: 'IBizAttachmentColumn',
  props: {
    value: {
      type: [String, Array<string>],
      required: true,
    },
    data: {
      type: Object as PropType<ControlVO>,
      required: true,
    },
    controller: {
      type: Object as PropType<GridFieldColumnController>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('attachment-column');
    const {
      getDownloadUrl,
      files,
      enableNoAccess,
      onDownload,
      getDownloadTicketParams,
    } = useFilesParse(props, props.controller);
    const loading = ref(true);

    const onLoad = (): void => {
      loading.value = false;
    };

    const renderImagePreview = (file: IData): JSX.Element => {
      return (
        <div class={ns.e('image-preview')} v-loading={loading.value}>
          <div class={ns.em('image-preview', 'container')}>
            <img alt='--' src={file.base64 || file.url} onLoad={onLoad}></img>
          </div>
        </div>
      );
    };

    /** 处理图片预览 */
    const handleImagePreview = async (file: IData): Promise<void> => {
      const overlay = ibiz.overlay.createModal(
        renderImagePreview(file),
        undefined,
        {
          modalClass: ns.e('image-preview'),
          width: 700,
          height: 'auto',
        },
      );
      overlay.present();
      await overlay.onWillDismiss();
    };

    /** 处理PDF预览 */
    const handlePDFPreview = async (file: IData): Promise<void> => {
      const downloadUrl = getDownloadUrl(props.data, file);
      let url = file.url || downloadUrl.replace('%fileId%', file.id);
      if (ibiz.config.common.enableDownloadTicket && !enableNoAccess) {
        const downloadTicket = await ibiz.util.file.getDownloadTicket(
          props.controller.context,
          props.controller.params,
          props.data,
          { fileId: file.id },
          getDownloadTicketParams(),
        );
        if (downloadTicket && downloadTicket.ticket) {
          url = downloadUrl.replace('%fileId%', downloadTicket.ticket);
        }
      }
      // 适配 url 拉起的文件没有 Content-Type 的情况。没有 Content-Type , link.click()会直接调用下载逻辑
      const response = await ibiz.net.request(url, {
        method: 'get',
        responseType: 'blob',
        baseURL: '', // 已经有baseURL了，这里无需再写
      });
      if (response.data) {
        const blob = new Blob([response.data as Blob], {
          type: 'application/pdf',
        });
        // 创建对象 URL
        const objectURL = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectURL;
        link.target = '_blank';
        link.style.cursor = 'pointer';
        link.textContent = file.name || '';
        const handleClick = function (): void {
          link.removeEventListener('click', handleClick);
          document.body.removeChild(link);
        };
        link.addEventListener('click', handleClick);
        document.body.appendChild(link);
        link.click();
      }
    };

    const handleFileClick = (file: IData): void => {
      const fileName = file.name;
      const fileExtension = fileName.split('.').pop()?.toLowerCase() ?? '';
      switch (getFileType(fileExtension)) {
        case 'image':
          // 打开图片预览
          handleImagePreview(file);
          break;
        case 'pdf':
          // 打开pdf预览
          handlePDFPreview(file);
          break;
        case 'other':
        default:
          // 直接下载文件
          onDownload(file);
          break;
      }
    };

    return {
      ns,
      files,
      handleFileClick,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        {this.files.map(file => {
          const fileName = file.name;
          const fileExtension = fileName.split('.').pop()?.toLowerCase() ?? '';
          const fileType = getFileType(fileExtension);
          return (
            <div
              class={this.ns.e('file')}
              title={file.name}
              onClick={() => this.handleFileClick(file)}
            >
              {fileType === 'image' ? (
                <img
                  alt=''
                  class={this.ns.em('file', 'img')}
                  src={file.base64 || file.url}
                />
              ) : (
                file.name
              )}
            </div>
          );
        })}
      </div>
    );
  },
});
