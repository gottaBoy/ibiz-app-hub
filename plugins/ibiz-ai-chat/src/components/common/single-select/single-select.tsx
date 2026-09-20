/* eslint-disable @typescript-eslint/no-explicit-any */
import { VNode } from 'preact';
import { useSignal } from '@preact/signals';
import { useState, useEffect, useRef } from 'preact/hooks';
import { aiChatT, Namespace } from '../../../utils';
import { ArrowDown, EmptySvg } from '../../../icons';
import { ChatSearch } from '../../chat-search/chat-search';
import { Loading } from '../loading/loading';
import './single-select.scss';

type Option = { value: string | number; label: string };

interface SingleSelectProps {
  /**
   * 选项列表
   *
   * @type {Option[]}
   * @memberof CommonSelectProps
   */
  options: Option[];

  /**
   * 当前选中值
   *
   * @type {string | number}
   * @memberof CommonSelectProps
   */
  value?: string | number;

  /**
   * 占位符文本
   *
   * @type {string}
   * @memberof CommonSelectProps
   */
  placeholder?: string;

  /**
   * 是否禁用
   *
   * @type {boolean}
   * @memberof CommonSelectProps
   */
  disabled?: boolean;

  /**
   * 启用搜索
   */
  enableSearch?: boolean;

  /**
   * 显示边框
   */
  showBorder?: boolean;

  /**
   * 弹出框样式
   */
  popperStyle?: any;

  /**
   * 图标
   * @returns
   */
  icon?: () => VNode;

  /**
   * 值改变回调
   *
   */
  onChange?: (value: string | number) => void;

  /**
   * 搜索
   * @param value
   * @returns
   */
  onSearch?: (value: string) => Promise<Option[]>;
}

const ns = new Namespace('chat-single-select');

export const SingleSelect = (props: SingleSelectProps) => {
  const {
    value,
    options,
    popperStyle,
    disabled = false,
    showBorder = true,
    enableSearch = false,
    placeholder = aiChatT('selectPlease'),
    icon,
    onChange,
    onSearch,
  } = props;

  const hasOptions = !!options.length;

  const buttonRef = useRef<any>(null);

  const dropdownRef = useRef<any>(null);

  const query = useSignal<string>('');

  const [selectedValue, setSelectedValue] = useState(value);

  const [list, setList] = useState(options);

  const [visible, setVisible] = useState(false);

  const [loading, setLoading] = useState(false);

  const displayValue =
    options.find(option => option.value === selectedValue)?.label ||
    placeholder;

  useEffect(() => {
    // 下拉关闭时重置搜索
    if (visible === false) {
      query.value = '';
      setList(options);
    }
  }, [visible]);

  // 监听value变化
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  useEffect(() => {
    setList(options);
  }, [options]);

  useEffect(() => {
    const handleGlobalMouseDown = (_e: MouseEvent) => {
      // 禁用不处理，下拉框由handleChange方法处理
      if (!hasOptions || disabled || dropdownRef.current?.contains(_e.target))
        return;
      if (buttonRef.current?.contains(_e.target)) {
        setVisible(prev => !prev);
      } else {
        setVisible(false);
      }
    };
    document.addEventListener('mousedown', handleGlobalMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleGlobalMouseDown);
    };
  }, []);

  /**
   * @description 处理选中改变
   * @param {Option} option
   */
  const handleSelectChange = (option: Option) => {
    setSelectedValue(option.value);
    onChange?.(option.value);
    setVisible(false);
  };

  /**
   * 搜索值变更
   * @param searchVal
   */
  const hadnleQueryChange = (searchVal: string) => {
    query.value = searchVal;
  };

  /**
   * @description 处理搜索
   * @param {string} searchVal
   */
  const handleSearch = async (searchVal: string) => {
    try {
      setLoading(true);
      let items: Option[] = [];
      if (onSearch) {
        items = await onSearch(searchVal);
      } else {
        items = options.filter(o =>
          o.label.toLowerCase().includes(searchVal.toLowerCase()),
        );
      }
      setList(items);
    } catch (error) {
      setList([]);
      console.error(aiChatT('searchFailed'), error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description 绘制下拉内容
   */
  const renderListContent = () => {
    if (loading) return <Loading></Loading>;
    if (list.length)
      return list.map(option => (
        <li
          key={option.value}
          title={option.label}
          onClick={() => handleSelectChange(option)}
          className={`${ns.em('dropdown', 'item')} ${ns.is('active', option.value === selectedValue)}`}
        >
          {option.label}
        </li>
      ));
    return (
      <li className={`el-empty ${ns.e('empty')}`}>
        {EmptySvg}
        <div className={ns.em('empty', 'text')}>{aiChatT('noData')}</div>
      </li>
    );
  };

  return (
    <div className={ns.b()}>
      <div
        className={`${ns.e('button')} ${showBorder ? ns.em('button', 'border') : ''} ${ns.is('focus', visible)}`}
        ref={buttonRef}
      >
        {icon ? (
          <span
            className={`${ns.em('button', 'icon')} ${ns.em('button', 'prefix')}`}
          >
            {icon()}
          </span>
        ) : null}
        <span title={displayValue} className={ns.em('button', 'caption')}>
          {displayValue}
        </span>
        {hasOptions ? (
          <span
            className={`${ns.em('button', 'icon')} ${ns.em('button', 'suffix')}`}
          >
            {ArrowDown()}
          </span>
        ) : null}
      </div>

      {visible ? (
        <div className={ns.e('dropdown')} ref={dropdownRef} style={popperStyle}>
          {enableSearch ? (
            <div className={ns.em('dropdown', 'search')}>
              <ChatSearch
                placeholder={aiChatT('search')}
                value={query.value}
                onEnter={handleSearch}
                onChange={hadnleQueryChange}
              />
            </div>
          ) : null}
          <ul className={ns.em('dropdown', 'list')}>{renderListContent()}</ul>
        </div>
      ) : null}
    </div>
  );
};
