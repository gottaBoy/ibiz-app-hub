import { useEffect, useState } from 'preact/hooks';
import { Namespace } from '../../../utils';
import './switch.scss';

export interface SwitchProps {
  /**
   * 值
   * - 默认为false
   */
  value?: boolean;
  /**
   * 值变更
   * @param value
   * @returns
   */
  onChange?: (value: boolean) => void;
}

const ns = new Namespace('chat-switch');

export const Switch = (props: SwitchProps) => {
  const { value = false, onChange } = props;

  const [checked, setChecked] = useState(value);

  useEffect(() => {
    setChecked(value);
  }, [value]);

  /**
   * 处理值变更
   */
  const handleChange = () => {
    setChecked(prev => !prev);
    onChange?.(checked);
  };

  return (
    <div
      className={`${ns.b()} ${ns.is('checked', checked)}`}
      onClick={handleChange}
    >
      <div className={ns.e('core')}>
        <div className={ns.e('action')}></div>
      </div>
    </div>
  );
};
