import { defineComponent, PropType, reactive } from 'vue';
import { IPortalAsyncAction } from '@ibiz-template/core';
import { IModal } from '@ibiz-template/runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import './async-data-export.scss';

export const AsyncDataExport = defineComponent({
  name: 'IBizAsyncDataExport',
  props: {
    asyncAction: {
      type: Object as PropType<IPortalAsyncAction>,
      required: true,
    },
    modal: { type: Object as PropType<IModal>, required: true },
  },
  setup(props) {
    const ns = useNamespace('async-data-export');

    // 结束状态
    const finishedStates = [30, 40];

    const onClose = () => {
      props.modal.dismiss();
    };

    const info = reactive({
      title: '',
      beginTime: '',
      endTime: '',
      fileUrl: '',
      fileName: '',
      isFinish: false,
    });

    info.title = ibiz.i18n.t(
      'panelComponent.userMessage.asyncDataExport.exportDetailPrompt',
      { name: props.asyncAction.asyncacitonname },
    );
    info.beginTime = props.asyncAction.begintime;
    info.endTime = props.asyncAction.endtime;
    if (props.asyncAction.asyncresultdownloadurl) {
      const asyncResultDownloadObj = JSON.parse(
        props.asyncAction.asyncresultdownloadurl,
      );
      info.fileUrl =
        `${ibiz.env.baseUrl}/${ibiz.env.appId}${ibiz.env.downloadFileUrl}/${asyncResultDownloadObj.folder}/${asyncResultDownloadObj.fileid}`.replace(
          '/{cat}',
          '',
        );
      info.fileName = asyncResultDownloadObj.filename;
    }
    if (!finishedStates.includes(props.asyncAction.actionstate)) {
      info.isFinish = false;
    } else {
      info.isFinish = true;
    }

    const onDownLoad = () => {
      ibiz.util.file.fileDownload(
        info.fileUrl,
        info.fileName,
        undefined,
        false,
      );
    };

    return { ns, info, onClose, onDownLoad };
  },
  render() {
    return (
      <div class={[this.ns.b()]}>
        <div class={this.ns.b('header')}>
          <div class={this.ns.e('title')}>{this.info.title}</div>
          <div class={this.ns.b('toolbar')}>
            {this.info.fileUrl && (
              <el-button onClick={this.onDownLoad}>
                {ibiz.i18n.t(
                  'panelComponent.userMessage.asyncDataExport.downloadFile',
                )}
              </el-button>
            )}
            <el-button onClick={this.onClose}>
              {ibiz.i18n.t('app.close')}
            </el-button>
          </div>
        </div>
        <div class={this.ns.b('time')}>
          {this.info.isFinish ? (
            <el-form-item
              label={ibiz.i18n.t(
                'panelComponent.userMessage.asyncDataExport.excuteTime',
              )}
            >
              {this.info.beginTime} ~ {this.info.endTime}
            </el-form-item>
          ) : (
            <span class={this.ns.be('time', 'executing')}>
              {ibiz.i18n.t(
                'panelComponent.userMessage.asyncDataExport.executing',
              )}
            </span>
          )}
        </div>
      </div>
    );
  },
});
