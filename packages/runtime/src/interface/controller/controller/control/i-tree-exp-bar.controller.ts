import { ITreeExpBar } from '@ibiz/model-core';
import { ITreeExpBarEvent } from '../../event';
import { ITreeExpBarState } from '../../state';
import { IExpBarControlController } from './i-exp-bar-control.controller';
import { IApiTreeExpBarController } from '../../../api';
import { IViewController } from '../view';

/**
 * @description 树导航栏控制器
 * @export
 * @interface ITreeExpBarController
 * @extends {IExpBarControlController<ITreeExpBar, ITreeExpBarState, ITreeExpBarEvent>}
 * @extends {IApiTreeExpBarController<ITreeExpBar, ITreeExpBarState>}
 */
export interface ITreeExpBarController
  extends IExpBarControlController<
      ITreeExpBar,
      ITreeExpBarState,
      ITreeExpBarEvent
    >,
    IApiTreeExpBarController<ITreeExpBar, ITreeExpBarState> {
  /**
   * @description 视图控制器
   * @type {IViewController}
   * @memberof ITreeExpBarController
   */
  view: IViewController;
}
