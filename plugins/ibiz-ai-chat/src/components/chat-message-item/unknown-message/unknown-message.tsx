import { aiChatT, Namespace } from '../../../utils';
import { IChatMessage } from '../../../interface';
import './unknown-message.scss';

export interface UnknownMessageProps {
  message: IChatMessage;
  /**
   * 内容大小，用于更新绘制
   *
   * @author chitanda
   * @date 2023-10-15 21:10:22
   * @type {number}
   */
  size: number;
}

const ns = new Namespace('unknown-message');

export const UnknownMessage = (props: UnknownMessageProps) => {
  return (
    <div className={ns.b()}>
      <div className={`${ns.e('content')} pre-wrap-container`}>
        {aiChatT('unsupportedMessage', { type: props.message.type })}
      </div>
    </div>
  );
};
