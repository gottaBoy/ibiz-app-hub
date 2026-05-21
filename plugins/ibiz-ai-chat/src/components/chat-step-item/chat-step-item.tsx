import { useEffect, useRef, useState } from 'preact/hooks';
import { CorrectSvg, FailSvg, LoadingSvg } from '../../icons';
import { IChatStep } from '../../interface';
import { Namespace } from '../../utils';
import './chat-step-item.scss';

export interface ChatStepItemProps {
  element: IChatStep;
}

const ns = new Namespace('chat-step-item');
export const ChatStepItem = (props: ChatStepItemProps) => {
  const { element } = props;

  const [caption, setCaption] = useState(element.title);

  const [showToggle, setShowToggle] = useState(false);

  const [expanded, setExpanded] = useState(false);

  const [itemHeight, setItemHeight] = useState(0);

  // 项内容块
  const itemBlack = useRef(null);

  // 内容文字块
  const contentText = useRef(null);

  // 初始化标题
  const initCaption = () => {
    if (element.title) {
      setCaption(element.title);
    } else if (element.content) {
      if (element.content.length > 20) {
        setCaption(`${element.content.substring(0, 19)}...`);
      }
      setCaption(element.content.substring(0, 19));
    }
  };

  // 初始化折叠状态
  const initEllipsis = () => {
    if (contentText.current) {
      const el: HTMLElement = contentText.current;
      // 1. 临时解除 clamp，获取真实高度
      el.style.display = 'block';
      const fullHeight = el.scrollHeight;
      el.style.display = '-webkit-box'; // 恢复 clamp 样式
      const clampedHeight = el.clientHeight;

      // 2. 判断是否溢出
      const isOverflowing = fullHeight > clampedHeight;

      if (isOverflowing) {
        setShowToggle(true);
      } else {
        setShowToggle(false);
      }
    }
  };

  // 初始化项高度
  const initItemHeight = () => {
    if (itemBlack.current) {
      const el: HTMLElement = itemBlack.current;
      setItemHeight(el.clientHeight);
    }
  };

  // 初始化
  useEffect(() => {
    // 初始化标题
    initCaption();
    // 初始化项高度
    initItemHeight();
    // 初始化折叠状态
    initEllipsis();
  }, []);

  // 监听内容变化动态设置项高度
  useEffect(() => {
    setTimeout(() => {
      initItemHeight();
    }, 0);
  }, [props.element.content]);

  // 切换按钮点击
  const handleToggleClick = () => {
    setExpanded(!expanded);
    setTimeout(() => {
      initItemHeight();
    }, 0);
  };

  return (
    <div
      ref={itemBlack}
      className={`${ns.b()}`}
      style={{ '--ibiz-chat-step-item-height': `${itemHeight}px` }}
    >
      <div className={`${ns.e('left')}`}>
        <div className={`${ns.e('icon')}`}>
          {element.status === 'success' && <CorrectSvg></CorrectSvg>}
          {element.status === 'failed' && <FailSvg></FailSvg>}
          {element.status === 'pending' && <LoadingSvg></LoadingSvg>}
        </div>
      </div>
      <div
        className={`${ns.e('right')} ${element.status === 'pending' ? 'is-loadding' : ''}`}
      >
        {element.status !== 'pending' && (
          <div className={`${ns.e('title')}`} title={caption}>
            {caption}
          </div>
        )}
        {element.status !== 'pending' && (
          <div className={`${ns.e('content')}`}>
            <div
              ref={contentText}
              className={`${ns.e('content-text')} ${expanded ? 'expanded' : ''}`}
            >
              {element.content || ''}
            </div>
            {showToggle && (
              <button
                className={`${ns.e('toggle-btn')}`}
                onClick={() => {
                  handleToggleClick();
                }}
              >
                {expanded ? '收起' : '展开全部'}
              </button>
            )}
          </div>
        )}
        {element.status === 'pending' && (
          <div className={`${ns.e('loadding-text')}`}>加载中......</div>
        )}
      </div>
    </div>
  );
};
