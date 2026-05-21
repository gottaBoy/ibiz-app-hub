/* eslint-disable no-setter-return */

import {
  IFormDetailState,
  ILayoutState,
  IFormDetailClass,
  IFormDetailContainerState,
} from '../../../../../interface';

/**
 * 表单项状态
 *
 * @author chitanda
 * @date 2023-01-04 09:01:02
 * @export
 * @class FormDetailState
 */
export class FormDetailState implements IFormDetailState {
  declare visible: boolean;

  disabled: boolean = false;

  declare keepAlive: boolean;

  layout: ILayoutState = {
    width: '',
    height: '',
    extraStyle: {},
    extraClass: [],
    contentStyle: {},
  };

  class: IFormDetailClass = {
    container: [],
    containerDyna: [],
    label: [],
    labelDyna: [],
  };

  /**
   * 是否必填
   *
   * @author chitanda
   * @date 2023-01-04 10:01:27
   * @type {boolean}
   */
  required: boolean = false;

  /**
   * 显示更多模式 {0：无、 1：受控内容、 2：管理容器}
   * @author lxm
   * @date 2023-03-17 02:16:43
   * @type {(0 | 1 | 2)}
   */
  showMoreMode: 0 | 1 | 2 | number = 0;

  /**
   * 是否只读
   *
   * @author zhanghengfeng
   * @date 2024-03-25 17:03:48
   * @type {boolean}
   */
  readonly: boolean = false;

  /**
   * 上下文对象
   *
   * @author tony001
   * @date 2024-04-16 16:04:29
   * @type {IContext}
   */
  context?: IContext;

  /**
   * 是否识别srfreadonly
   *
   * @author zhanghengfeng
   * @date 2024-06-13 13:06:50
   * @type {boolean}
   */
  enableReadonly: boolean = true;

  /**
   * @description 计数器数据
   * @type {IData}
   * @memberof FormDetailState
   */
  counterData: IData = {};

  constructor(protected parent?: IFormDetailContainerState) {
    // 定义是否显示，set方法需要返回true,否则vue proxy报错
    let $visible: boolean = true;
    Object.defineProperty(this, 'visible', {
      enumerable: true,
      configurable: true,
      get() {
        // 有父先看父
        if (this.parent) {
          // 父不显示子不显示
          if (this.parent.visible === false) {
            return false;
          }
          // 受控内容父更多显示不开启，不显示
          if (this.showMoreMode === 1 && this.parent.isShowMore === false) {
            return false;
          }
        }
        return $visible;
      },
      set(val) {
        $visible = val;
        return true;
      },
    });

    // 定义是否保活
    let $keepAlive: boolean | undefined;
    Object.defineProperty(this, 'keepAlive', {
      enumerable: true,
      configurable: true,
      get() {
        // 自身设置了值则只看自身
        if ($keepAlive !== undefined) {
          return $keepAlive;
        }
        // 自身没有设置值，看父
        if (this.parent) {
          return this.parent.keepAlive;
        }
        return false;
      },
      set(val) {
        $keepAlive = val;
        // eslint-disable-next-line no-setter-return
        return true;
      },
    });

    // 定义只读状态
    let $readonly: boolean;
    Object.defineProperty(this, 'readonly', {
      enumerable: true,
      configurable: true,
      get() {
        // 自身设置了值则只看自身
        if ($readonly !== undefined) {
          return $readonly;
        }
        // 自身没有设置值，看父
        if (this.context && this.enableReadonly) {
          return !!(
            this.context.srfreadonly === true ||
            this.context.srfreadonly === 'true'
          );
        }
        return false;
      },
      set(val) {
        $readonly = val;
        return true;
      },
    });
  }
}
