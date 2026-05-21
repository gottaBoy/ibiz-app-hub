import { Namespace } from '../../utils';
import './chat-image-preview.scss';

export interface ChatImagePreviewProps {
  /**
   * @description 图片路径
   * @type {string}
   * @memberof ChatImagePreviewProps
   */
  src: string;

  /**
   * @description 关闭
   * @memberof ChatImagePreviewProps
   */
  onClose?: (e: MouseEvent) => void;
}

export const ChatImagePreview = (props: ChatImagePreviewProps) => {
  const ns = new Namespace('chat-image-preview');

  return (
    <div className={`el-image-viewer__wrapper ${ns.b()}`}>
      <div
        className='el-image-viewer__mask'
        onClick={evt => props.onClose?.(evt)}
      ></div>
      <span
        className='el-image-viewer__btn el-image-viewer__close'
        onClick={evt => props.onClose?.(evt)}
      >
        <i className='el-icon'>
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024'>
            <path
              fill='currentColor'
              d='M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z'
            ></path>
          </svg>
        </i>
      </span>
      <div
        className='el-image-viewer__canvas'
        onClick={evt => evt.stopPropagation()}
      >
        <img
          src={props.src}
          className='el-image-viewer__img'
          style='transform: scale(1) rotate(0deg) translate(0px, 0px);'
        />
      </div>
    </div>
  );
};
