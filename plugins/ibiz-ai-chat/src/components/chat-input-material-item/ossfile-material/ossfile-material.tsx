import { useComputed } from '@preact/signals';
import { aiChatT, Namespace } from '../../../utils';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AiChatController } from '../../../controller';
import { IMaterial } from '../../../interface';
import './ossfile-material.scss';
import { DownLoadSvg, FileSvg } from '../../../icons';

export interface OssfileMaterialProps {
  controller: AiChatController;
  material: IMaterial;
}

const ns = new Namespace('ossfile-material');

export const OssfileMaterial = (props: OssfileMaterialProps) => {
  const content = useComputed(() => (props.material.data as any).name);

  // 文件大小格式化函数
  const formatFileSize = (size: number): string => {
    if (size >= 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(2)}M`;
    }
    if (size >= 1024) {
      return `${(size / 1024).toFixed(2)}K`;
    }
    return `${size}B`;
  };

  // 计算大小
  const size = useComputed(() => {
    const rawSize = (props.material.metadata as any).size;
    return formatFileSize(rawSize);
  });

  const state = useComputed(() => (props.material.metadata as any).state);

  const stateText = useComputed(() => {
    const tempState = (props.material.metadata as any).state;
    if (tempState === 'successed') {
      return aiChatT('uploadSuccess');
    }
    if (tempState === 'uploading') {
      return aiChatT('uploading');
    }
    if (tempState === 'failed') {
      return aiChatT('uploadFailed');
    }
    return aiChatT('unknownStatus');
  });

  const stateColor = useComputed(() => {
    const tempState = (props.material.metadata as any).state;
    switch (tempState) {
      case 'successed':
        return '#1890ff'; // 蓝色
      case 'uploading':
        return '#52c41a'; // 绿色
      case 'failed':
        return '#ff4d4f'; // 红色
      default:
        return '#ff4d4f'; // 未知状态红色
    }
  });

  const downloadFile = () => {
    const metadata = props.material.metadata;
    const uploader = props.controller.opts.uploader;
    uploader.onDownLoad(metadata, {
      context: props.controller.context,
      params: props.controller.params,
    });
  };

  return (
    <div className={ns.b()}>
      <div className={ns.b('left')}>
        <FileSvg />
      </div>
      <div className={ns.b('right')}>
        <div className={ns.e('name')} title={content}>
          {content}
        </div>
        <div className={ns.b('metadata')}>
          <div>{size}</div>
          {state.value !== 'successed' && (
            <div style={{ color: stateColor.value }}>{stateText}</div>
          )}
          {state.value === 'successed' && (
            <div
              className={ns.be('metadata', 'img')}
              title={aiChatT('download')}
              onClick={downloadFile}
            >
              <DownLoadSvg />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
