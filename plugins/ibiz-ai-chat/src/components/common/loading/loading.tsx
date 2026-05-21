import { Namespace } from '../../../utils';
import { LoadingIcon } from '../../../icons';
import './loading.scss';

export interface LoadingProps {
  /**
   * loading图大小
   */
  size?: number;
}

const ns = new Namespace('chat-loading');

export const Loading = (props: LoadingProps) => {
  const { size = 24 } = props;

  return (
    <div className={ns.b()}>
      <div
        className={ns.e('spinner')}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <LoadingIcon></LoadingIcon>
      </div>
    </div>
  );
};
