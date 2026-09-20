/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { aiChatT, Namespace } from '../../../utils';
import { IChatToolCall } from '../../../interface';
import {
  ErrorSvg,
  ImageSvg,
  ExpandSvg,
  CopyingSvg,
  CopyPasteSvg,
} from '../../../icons';
import { ChatImagePreview } from '../../chat-image-preview/chat-image-preview';
import './image-tool-call.scss';

export interface ImageToolCallProps {
  item: IChatToolCall;
  className?: string;
}

export const ImageToolCall = (props: ImageToolCallProps) => {
  const ns = new Namespace('image-tool-call');
  // 是否预览
  const isPreview = useSignal<boolean>(false);
  // 是否展开
  const isExpand = useSignal<boolean>(false);
  // 是否正在拷贝
  const isCopying = useSignal<boolean>(false);
  // 定时器ID
  let timerId: NodeJS.Timeout | undefined;

  // 处理折叠
  const onCollapse = () => {
    isExpand.value = !isExpand.value;
  };

  // 处理复制
  const onCopy = (event: MouseEvent) => {
    event.stopPropagation();
    if (isCopying.value) return;
    if (timerId) clearTimeout(timerId);
    isCopying.value = true;
    navigator.clipboard.writeText(JSON.stringify(props.item, undefined, 2));
    (window as any).ibiz.message.success(aiChatT('copied'));
    timerId = setTimeout(() => {
      isCopying.value = false;
    }, 2000);
  };

  // 添加 useEffect 来处理组件销毁时的清理，空依赖数组表示只在组件挂载和销毁时执行
  useEffect(() => {
    // 返回清理函数，在组件销毁时执行
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  const onChangePreview = () => {
    if (!props.item.result?.image_url) return;
    isPreview.value = !isPreview.value;
  };

  /**
   * @description 绘制内容
   * @returns {*}
   */
  const renderContent = () => {
    if (props.item.error)
      return (
        <div className={`${ns.e('error')} ${ns.e('center-text')}`}>
          {props.item.result}
        </div>
      );
    if (props.item.result?.image_url || props.item.result?.content)
      return [
        <img
          key='image'
          className={ns.e('image')}
          src={props.item.result?.image_url}
          onClick={onChangePreview}
        />,
        <div className={ns.e('description')} key='description'>
          {props.item.result?.content}
        </div>,
      ];
    return (
      <div className={`${ns.e('center-text')}`}>{aiChatT('noDataLabel')}</div>
    );
  };

  return (
    <div className={`${ns.b()} ${props.className || ''}`}>
      <div className={ns.e('header')} onClick={() => onCollapse()}>
        <div className={ns.e('header-left')}>
          <div className={ns.em('header-left', 'icon')}>{ImageSvg}</div>
          <div className={ns.em('header-left', 'caption')}>
            {aiChatT('imageRecognition')}
          </div>
          <div
            className={ns.em('header-left', 'desc')}
            title={props.item.parameters?.desc || ''}
          >
            {props.item.parameters?.desc || ''}
          </div>
        </div>
        <div className={ns.e('header-right')}>
          {props.item.error && (
            <span style='color: red;'>{aiChatT('error')}</span>
          )}
          {props.item.error && ErrorSvg}
          <span
            title={aiChatT('copy')}
            className={ns.e('copy')}
            onClick={(event: MouseEvent) => onCopy(event)}
          >
            {isCopying.value ? CopyingSvg : CopyPasteSvg}
          </span>
          <ExpandSvg
            style={{
              'margin-left': ' 6px',
              transform: isExpand.value ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          />
        </div>
      </div>
      {isExpand.value && (
        <div className={ns.e('content')}>{renderContent()}</div>
      )}
      {isPreview.value && (
        <ChatImagePreview
          src={props.item.result?.image_url}
          onClose={onChangePreview}
        />
      )}
    </div>
  );
};
