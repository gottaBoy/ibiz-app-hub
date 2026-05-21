/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'preact/hooks';
import { Namespace } from '../../utils';
import { SearchSvg } from '../../icons';
import './chat-search.scss';

export interface ChatSearchProps {
  /**
   * 值
   *
   * @type {string}
   * @memberof ChatSearchProps
   */
  value: string | undefined;
  /**
   * 类名
   *
   * @type {string}
   * @memberof ChatSearchProps
   */
  className?: string;
  /**
   * 空白占位
   *
   * @type {string}
   * @memberof ChatSearchProps
   */
  placeholder?: string;
  /**
   * 点击事件
   *
   * @memberof ChatSearchProps
   */
  onChange?: (value: string) => void;
  /**
   * 回车事件
   * @param value
   * @returns
   */
  onEnter?: (value: string) => void;
}

const ns = new Namespace('chat-search');

export const ChatSearch = (props: ChatSearchProps) => {
  const { className, value, placeholder, onChange, onEnter } = props;

  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (event: any) => {
    event.stopPropagation();
    onChange?.(event.target?.value);
  };

  const onKeyDown = (event: any) => {
    if (event.code === 'Enter') onEnter?.(event.target?.value);
  };

  return (
    <div
      className={`${ns.b()} ${ns.is('focus', isFocused)} ${className || ''}`}
    >
      <div className={ns.e('prefix')}>
        <SearchSvg />
      </div>
      <input
        value={value}
        className={ns.e('inner')}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={event => handleChange(event)}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};
