/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'preact/hooks';
import { Namespace } from '../../utils';
import { SettingSvg } from '../../icons';
import { SingleSelect, Slider } from '../common';
import { AiChatController } from '../../controller';
import './chat-agent-setting.scss';

interface ChatAgentSettingProps {
  /**
   * 聊天控制器
   */
  controller: AiChatController;
}

const ns = new Namespace('chat-agent-setting');

export const ChatAgentSetting = (props: ChatAgentSettingProps) => {
  const { controller } = props;

  const buttonRef = useRef<any>(null);
  const dropdownRef = useRef<any>(null);

  const [visible, seVisible] = useState(false);

  const options = [
    {
      label: '禁用',
      value: 0,
    },
    {
      label: '启用',
      value: 1,
    },
    {
      label: '自动',
      value: 2,
    },
  ];

  useEffect(() => {
    // 监听外部点击
    const handleGlobalMouseDown = (e: MouseEvent) => {
      if (e.target && dropdownRef.current?.contains(e.target)) return;
      if (buttonRef.current?.contains(e.target)) {
        seVisible(prev => !prev);
      } else {
        seVisible(false);
      }
    };
    document.addEventListener('mousedown', handleGlobalMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleGlobalMouseDown);
    };
  }, []);

  return (
    <div className={ns.b()}>
      <div className={ns.e('button')} ref={buttonRef}>
        <span
          title='召回设置'
          className={`${ns.em('button', 'icon')} ${ns.em('button', 'prefix')}`}
        >
          {SettingSvg()}
        </span>
      </div>
      {visible ? (
        <div className={ns.e('dropdown')} ref={dropdownRef}>
          <ul className={ns.em('dropdown', 'list')}>
            <li
              className={`${ns.em('dropdown', 'item')} ${ns.is('horizontal', true)}`}
            >
              <div className={ns.em('dropdown', 'item-label')}>召回重排:</div>
              <SingleSelect
                options={options}
                value={controller.reCallConfig.value.chunkrerank}
                onChange={val =>
                  controller.setAIAgentConfig({ chunkrerank: val })
                }
                popperStyle={{
                  width: '90px',
                  bottom: 'inherit',
                  top: 'calc(100% + 4px)',
                }}
              />
            </li>
            <li
              className={`${ns.em('dropdown', 'item')} ${ns.is('vertical', true)}`}
            >
              <div className={ns.em('dropdown', 'item-label')}>
                最大召回数量: {controller.reCallConfig.value.maxchunks}
              </div>
              <Slider
                min={0}
                max={20}
                step={1}
                value={controller.reCallConfig.value.maxchunks}
                onChange={val =>
                  controller.setAIAgentConfig({ maxchunks: val })
                }
              />
            </li>
            <li
              className={`${ns.em('dropdown', 'item')} ${ns.is('vertical', true)}`}
            >
              <div className={ns.em('dropdown', 'item-label')}>
                召回相似度阈值: {controller.reCallConfig.value.chunkthreshold}
              </div>
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={controller.reCallConfig.value.chunkthreshold}
                onChange={val =>
                  controller.setAIAgentConfig({ chunkthreshold: val })
                }
              />
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  );
};
