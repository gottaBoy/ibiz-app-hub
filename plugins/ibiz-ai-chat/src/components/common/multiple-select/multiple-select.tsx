/* eslint-disable @typescript-eslint/no-explicit-any */
import { VNode } from 'preact';
import { useSignal } from '@preact/signals';
import { useEffect, useRef, useState } from 'preact/hooks';
import { Namespace } from '../../../utils';
import { ArrowDown, EmptySvg } from '../../../icons';
import { ChatSearch } from '../../chat-search/chat-search';
import { Loading } from '../loading/loading';
import './multiple-select.scss';

type Option = { value: string; label: string };

interface MultipleSelectProps {
  /**
   * @description 选项列表
   * @type {Option[]}
   * @memberof MultipleSelectProps
   */
  options: Option[];

  /**
   * @description 图标
   * @memberof MultipleSelectProps
   */
  icon?: () => VNode;

  /**
   * @description 占位符文本
   * @type {string}
   * @memberof MultipleSelectProps
   */
  placeholder?: string;

  /**
   * @description 当前选中值
   * @type {string[]}
   * @memberof MultipleSelectProps
   */
  value?: string[];

  /**
   * 启用搜索
   */
  enableSearch?: boolean;

  /**
   * 弹出框样式
   */
  popperStyle?: any;

  /**
   * @description 值变更回调
   * @memberof MultipleSelectProps
   */
  onChange?: (value: string[]) => void;

  /**
   * 搜索
   * @param value
   * @returns
   */
  onSearch?: (value: string) => Promise<Option[]>;
}

const ns = new Namespace('chat-multiple-select');

export const MultipleSelect = (props: MultipleSelectProps) => {
  const {
    value,
    options,
    placeholder,
    popperStyle,
    enableSearch = false,
    icon,
    onChange,
    onSearch,
  } = props;

  const buttonRef = useRef<any>(null);
  const dropdownRef = useRef<any>(null);

  const query = useSignal<string>('');

  const [visible, setVisible] = useState(false);

  const [loading, setLoading] = useState(false);

  const [seletions, setSeletions] = useState(value || []);

  const [list, setList] = useState(options);

  useEffect(() => {
    // 下拉关闭时重置搜索
    if (visible === false) {
      query.value = '';
      setList(options);
    }
  }, [visible]);

  useEffect(() => {
    setSeletions(value || []);
  }, [value]);

  useEffect(() => {
    setList(options);
  }, [options]);

  useEffect(() => {
    // 监听点击
    const handleGlobalMouseDown = (e: MouseEvent) => {
      if (e.target && dropdownRef.current?.contains(e.target)) return;
      if (buttonRef.current?.contains(e.target)) {
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
    const isSelected = seletions.includes(option.value);
    const _seletions: string[] = isSelected
      ? seletions.filter(v => v !== option.value)
      : [...seletions, option.value];
    setSeletions(_seletions);
    onChange?.(_seletions);
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
      console.error('搜索失败:', error);
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
          className={ns.em('dropdown', 'item')}
          onClick={() => handleSelectChange(option)}
        >
          <input
            type='checkbox'
            value={option.value}
            className={ns.em('dropdown', 'item-checkbox')}
            checked={seletions.includes(option.value)}
          ></input>
          <div className={ns.em('dropdown', 'item-label')}>{option.label}</div>
        </li>
      ));
    return (
      <li className={`el-empty ${ns.e('empty')}`}>
        {EmptySvg}
        <div className={ns.em('empty', 'text')}>暂无数据</div>
      </li>
    );
  };

  return (
    <div className={ns.b()}>
      <div className={ns.e('button')} ref={buttonRef} title={placeholder}>
        {icon ? (
          <span
            className={`${ns.em('button', 'icon')} ${ns.em('button', 'prefix')}`}
          >
            {icon()}
          </span>
        ) : null}
        {placeholder
          ? [
              <span key='placeholder' className={ns.em('button', 'caption')}>
                {placeholder}
              </span>,
              <span
                key='icon'
                className={`${ns.em('button', 'icon')} ${ns.em('button', 'suffix')}`}
              >
                {ArrowDown()}
              </span>,
            ]
          : null}
      </div>
      {visible ? (
        <div className={ns.e('dropdown')} ref={dropdownRef} style={popperStyle}>
          {enableSearch ? (
            <div className={ns.em('dropdown', 'search')}>
              <ChatSearch
                placeholder='搜索'
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
