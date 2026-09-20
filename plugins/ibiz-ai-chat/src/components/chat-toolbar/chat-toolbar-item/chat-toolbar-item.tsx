import { useEffect, useRef, useState } from 'preact/hooks';
import { aiChatT, Namespace, isSvg } from '../../../utils';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { IChatToolbarItem } from '../../../interface';
import './chat-toolbar-item.scss';

export interface ChatToolberItemProps {
  /**
   * 工具栏项模型
   *
   * @type {IChatToolbarItem}
   * @memberof ChatToolberItemProps
   */
  model: IChatToolbarItem;
  /**
   * 业务数据
   *
   * @type {*}
   * @memberof ChatToolberItemProps
   */
  data: any;
  /**
   * 是否禁用
   *
   * @type {boolean}
   * @memberof ChatToolberItemProps
   */
  disabled?: boolean;
  /**
   * 类名
   *
   * @type {string}
   * @memberof ChatToolberItemProps
   */
  className?: string;
  /**
   * 按钮类型
   *
   * @type {('default' | 'circle')}
   * @memberof ChatToolberItemProps
   */
  buttonType?: 'default' | 'circle';
  /**
   * 点击事件
   *
   * @memberof ChatToolberItemProps
   */
  onClick: (e: MouseEvent, item: IChatToolbarItem) => void;
}

const ns = new Namespace('chat-toolbar-item');

export const ChatToolberItem = (props: ChatToolberItemProps) => {
  const {
    model,
    data,
    className,
    disabled = false,
    buttonType = 'default',
    onClick,
  } = props;

  const [isVisible, setIsVisible] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  /**
   * 是否隐藏
   *
   * @param {IChatToolbarItem} model
   * @return {*}  {boolean}
   */
  const isHidden = (item: IChatToolbarItem): boolean => {
    if (typeof item.hidden === 'function') return item.hidden(data);
    return item.hidden === true;
  };

  // 隐藏不绘制
  if (isHidden(model)) return <></>;

  /**
   * 是否禁用
   *
   * @param {IChatToolbarItem} item
   * @return {*}  {boolean}
   */
  const isDisabled = (item: IChatToolbarItem): boolean => {
    if (disabled) return true;
    if (typeof item.disabled === 'function') return item.disabled(data);
    return item.disabled === true;
  };

  /**
   * 绘制图标
   *
   * @param {IChatToolbarItem} item
   * @return {*}
   */
  const renderIcon = (item: IChatToolbarItem) => {
    if (typeof item.icon === 'function') return item.icon();
    if (item.icon?.showIcon && item.icon?.cssClass)
      return <i className={item.icon.cssClass} />;
    if (item.icon?.showIcon && item.icon?.imagePath) {
      if (isSvg(item.icon.imagePath))
        return (
          <div
            dangerouslySetInnerHTML={{
              __html: item.icon.imagePath,
            }}
          />
        );
      return <img src={item.icon.imagePath} />;
    }
  };

  /**
   * 打开更多
   *
   * @param {MouseEvent} _event
   */
  const openMore = (_event: MouseEvent) => {
    if (isDisabled(model)) return;
    setIsVisible(true);
  };

  /**
   * 处理项点击
   *
   * @param {MouseEvent} e
   * @param {IChatToolbarItem} item
   */
  const handleItemClick = (e: MouseEvent, item: IChatToolbarItem) => {
    if (isDisabled(item)) return;
    setIsVisible(false);
    onClick(e, item);
  };

  useEffect(() => {
    // 监听外部点击
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        dropdownRef.current.contains(event.target as Node)
      )
        return;
      setIsVisible(false);
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  return (
    <div
      className={`${ns.b()} ${ns.b(buttonType)} ${model.customClass || ''} ${
        className || ''
      } ${ns.is('disabled', isDisabled(model))} ${ns.is(
        'more',
        !!model.children?.length,
      )}`}
    >
      <div
        title={model.title}
        className={ns.e('content')}
        onClick={e => handleItemClick(e, model)}
      >
        <div className={ns.em('content', 'icon')}>{renderIcon(model)}</div>
        <div className={ns.em('content', 'label')}>{model.label}</div>
      </div>
      {model.children?.length && (
        <div
          title={aiChatT('more')}
          className={ns.e('more')}
          onClick={openMore}
        >
          <i
            aria-hidden='true'
            className={`fa fa-angle-down ${ns.em('more', 'icon')}`}
          />
        </div>
      )}
      {isVisible && (
        <div ref={dropdownRef} className={ns.b('dropdown')}>
          {model.children?.map((child, index) => {
            if (isHidden(child)) return;
            return (
              <div
                key={index}
                title={child.title}
                onClick={e => handleItemClick(e, child)}
                className={`${ns.be('dropdown', 'item')} ${
                  child.customClass || ''
                } ${ns.is('disabled', isDisabled(child))}`}
              >
                <div className={ns.bem('dropdown', 'item', 'icon')}>
                  {renderIcon(child)}
                </div>
                <div className={ns.bem('dropdown', 'item', 'label')}>
                  {child.label}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
