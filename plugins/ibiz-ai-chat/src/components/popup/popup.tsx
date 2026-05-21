import { VNode } from 'preact';
import { useState, useRef, useEffect, useContext } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import { Namespace } from '../../utils';
import { ContainerContext } from '../chat-container/chat-container';
import './popup.scss';

// 定义 position 类型
type Position = 'top' | 'bottom' | 'left' | 'right' | 'top-left';

// 定义行为数据类型
interface ActionItem {
  id: string;
  caption: string;
  icon?: VNode;
}

export const Popup = ({
  triggerMode,
  children,
  actions, // 接收行为数据
  content,
  position = 'bottom',
  isOpen: isOpenProp,
  onToggleOpen,
  onAction, // 接收行为事件回调
}: {
  triggerMode: 'click' | 'hover';
  children: import('preact').ComponentChildren;
  actions?: ActionItem[]; // 添加 actions 属性
  content?: import('preact').ComponentChildren;
  position?: Position;
  isOpen?: boolean;
  onToggleOpen?: (isOpen: boolean) => void;
  onAction?: (actionId: string, event: MouseEvent) => void; // 添加 onAction 属性
}) => {
  const ns = new Namespace('pop');

  // 容器注入参数
  const containerContext = useContext(ContainerContext);

  const [isOpen, setIsOpen] = useState(isOpenProp || false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const portalContainer = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 监听外部传入的 isOpen 变化
  useEffect(() => {
    if (isOpenProp !== undefined) {
      setIsOpen(isOpenProp);
    }
  }, [isOpenProp]);

  // 创建 portal 容器
  useEffect(() => {
    if (!portalContainer.current) {
      portalContainer.current = document.createElement('div');
      portalContainer.current.className = ns.b('content-container');
      document.body.appendChild(portalContainer.current);
    }
    return () => {
      if (portalContainer.current) {
        document.body.removeChild(portalContainer.current);
      }
    };
  }, []);

  // 处理外部点击
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(`.${ns.b()}`) &&
        !(event.target as HTMLElement).closest('.ibiz-quick-edit') &&
        !(event.target as HTMLElement).closest('.ibiz-picker__transfer')
      ) {
        setIsOpen(false);
        onToggleOpen?.(false); // 通知外部状态更新
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggleOpen]);

  // 获取定位样式
  const getPositionStyle = () => {
    if (!triggerRef.current) return {};
    const rect = triggerRef.current.getBoundingClientRect();

    const baseStyle = {
      position: 'absolute',
      zIndex: containerContext.zIndex + 1,
    };

    const positions = {
      bottom: {
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      },
      top: {
        bottom: window.innerHeight - rect.top + window.scrollY,
        left: rect.left + window.scrollX,
      },
      left: {
        top: rect.top + window.scrollY,
        right: window.innerWidth - rect.left + window.scrollX,
      },
      right: {
        top: rect.top + window.scrollY,
        left: rect.right + window.scrollX,
      },
      'top-left': {
        bottom: window.innerHeight - rect.top + window.scrollY,
        right: window.innerWidth - rect.left + window.scrollX,
      },
    };

    return { ...baseStyle, ...positions[position] };
  };

  // 清除关闭定时器
  const clearCloseTimer = () => {
    if (closeTimerRef.current && triggerMode === 'hover') {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  // 处理点击打开
  const handleClickOpen = (e: MouseEvent) => {
    if (triggerMode === 'click') {
      e.stopPropagation();
      const newIsOpen = !isOpen;
      setIsOpen(newIsOpen);
      onToggleOpen?.(newIsOpen);
    }
  };

  // 触发打开弹窗
  const scheduleOpen = (e: MouseEvent) => {
    if (triggerMode === 'hover') {
      e.stopPropagation();
      clearCloseTimer();
      const newIsOpen = true;
      setIsOpen(newIsOpen);
      onToggleOpen?.(newIsOpen);
    }
  };

  // 延迟关闭弹窗
  const scheduleClose = () => {
    if (triggerMode === 'hover') {
      clearCloseTimer();
      closeTimerRef.current = setTimeout(() => {
        setIsOpen(false);
        onToggleOpen?.(false);
      }, 100); // 100ms 延迟，给用户一点时间移动到弹窗上
    }
  };

  return (
    <span className={`${ns.b('trigger-container')}`}>
      {/* 触发元素 */}
      <span
        className={`${ns.b('trigger-element')}`}
        ref={triggerRef}
        onClick={e => {
          handleClickOpen(e);
        }}
        onMouseEnter={e => {
          scheduleOpen(e);
        }}
        onMouseLeave={e => {
          e.stopPropagation();
          scheduleClose();
        }}
      >
        {children}
      </span>

      {/* 使用 Portal 渲染到 body */}
      {isOpen &&
        portalContainer.current &&
        createPortal(
          <div
            className={`${ns.b()} pop-${position}`}
            style={getPositionStyle()}
            onMouseEnter={clearCloseTimer}
            onMouseLeave={scheduleClose}
          >
            {content ||
              actions?.map(action => (
                <div
                  key={action.id}
                  title={action.caption}
                  className={ns.e('item')}
                  onMouseDown={e => {
                    e.stopPropagation();
                    onAction?.(action.id, e);
                  }}
                >
                  {action.icon}
                  <div className={ns.em('item', 'caption')}>
                    {action.caption}
                  </div>
                </div>
              ))}
          </div>,
          portalContainer.current,
        )}
    </span>
  );
};
