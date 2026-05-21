/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChevronForwardSvg } from '../../icons';
import { IChatSuggestion, IChatUIAction } from '../../interface';
import { Namespace } from '../../utils';
import './chat-suggestions.scss';

export interface ChatSuggestionsProps {
  /**
   * 聊天建议集合
   *
   * @author tony001
   * @date 2025-03-18 14:03:17
   * @type {IChatSuggestion[]}
   */
  suggestions: IChatSuggestion[];

  /**
   * 界面操作集合
   */
  uiactions: IChatUIAction[];

  /**
   * 建议点击事件回调
   *
   * @author tony001
   * @date 2025-03-18 14:03:30
   */
  onSuggestionClick?: (item: IChatSuggestion, event: MouseEvent) => void;

  /**
   * 界面操作点击事件回调
   * @param item
   * @param event
   * @returns
   */
  onUIActionClick?: (item: IChatUIAction, event: MouseEvent) => void;
}
/**
 * [{
  "type": "action",
  "data": {
    "actionid": "openmainview@hr_employee",
	  "appid":"xxxx"
  },
  "metadata": {
   "content_name": "打开建立数据",
   "action_context": "hr_employee:${params.employee.id}"
  }
},{
  "type": "raw",
  "data": {
    "content": "确认生成"
  },
  "metadata": {
   "content_name": "确认生成"
  }
}]
 */
export const ChatSuggestions = (props: ChatSuggestionsProps) => {
  const { suggestions, onSuggestionClick, uiactions, onUIActionClick } = props;

  const handleSuggestionClick = (item: IChatSuggestion, event: MouseEvent) => {
    onSuggestionClick?.(item, event);
  };

  const handUIActionClick = (item: IChatUIAction, event: MouseEvent) => {
    onUIActionClick?.(item, event);
  };

  const ns = new Namespace('chat-suggestions');

  return (
    <div className={`${ns.b()}`}>
      {suggestions &&
        suggestions.length > 0 &&
        suggestions.map((item, index) => {
          return (
            <div
              key={index}
              className={`${ns.e('item')} ${ns.is(
                'action',
                item.type === 'action',
              )}`}
              onClick={(event: MouseEvent) =>
                handleSuggestionClick(item, event)
              }
              title={(item.metadata as any).content_name}
            >
              {(item.metadata as any).content_name}
              <ChevronForwardSvg className={`${ns.e('item-icon')}`} />
            </div>
          );
        })}
      {uiactions &&
        uiactions.length > 0 &&
        uiactions.map((item, index) => {
          return (
            <div
              key={`action-${index}`}
              className={`${ns.e('item')} ${ns.is('action', item.type === 'action')}`}
              onClick={(event: MouseEvent) => handUIActionClick(item, event)}
              title={(item.metadata as any).content_name}
            >
              {(item.metadata as any).content_name}
              <ChevronForwardSvg className={`${ns.e('item-icon')}`} />
            </div>
          );
        })}
    </div>
  );
};
