/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { QXEvent } from 'qx-util';
import { IOverlayContainer } from '@ibiz-template/runtime';
import { App, Component, h, VNode } from 'vue';
import { RuntimeError } from '@ibiz-template/core';
import { isElement } from 'lodash-es';

/**
 * 全局弹出承载组件
 *
 * @author chitanda
 * @date 2022-11-09 12:11:09
 * @export
 * @class OverlayContainer
 */
export class OverlayContainer<O extends IData = IData>
  implements IOverlayContainer
{
  protected vm?: App;

  /**
   * 具体模态组件
   *
   * @author chitanda
   * @date 2022-11-09 12:11:34
   * @protected
   * @type {*}
   */
  protected modal: any;

  /**
   * 外面调用dismiss时传的result结果
   *
   * @author lxm
   * @date 2022-11-09 20:11:06
   * @protected
   * @type {unknown}
   */
  protected result?: unknown;

  /**
   * 内部事件
   *
   * @author chitanda
   * @date 2022-11-09 12:11:42
   * @protected
   */
  protected evt: QXEvent<{ dismiss: (data?: unknown) => void }> = new QXEvent();

  /**
   * 创建全局呈现
   *
   * @author chitanda
   * @date 2022-11-09 14:11:52
   * @param {unknown} component
   * @param {(h: CreateElement) => VNode} render
   * @param {IPopoverOptions} [opts]
   */
  constructor(
    protected component: unknown,
    protected render: (...args: any[]) => VNode,
    protected opts?: O,
  ) {
    this.init();
  }

  static createVueApp(
    _rootComponent: Component,
    _rootProps?: IData,
  ): App<Element> {
    throw new RuntimeError(ibiz.i18n.t('vue3Util.util.noInjected'));
  }

  /**
   * 初始化飘窗
   *
   * @author chitanda
   * @date 2022-11-09 12:11:55
   * @protected
   * @return {*}  {void}
   */
  protected init(): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const { render, opts } = this;
    const container = document.createElement('div');
    let appendTo: HTMLElement = document.body;
    if (isElement(opts?.appendTo)) {
      appendTo = opts?.appendTo;
    }
    appendTo.appendChild(container);
    const vm = OverlayContainer.createVueApp({
      mounted() {
        self.modal = this.$refs.root;
      },
      unmounted() {
        appendTo.removeChild(container);
        self.evt.emit('dismiss', self.result);
      },
      render() {
        return h(
          self.component as string,
          {
            ref: 'root',
            opts,
            onDismiss(data: IData) {
              self.result = data;
              vm.unmount();
            },
          },
          { default: render },
        );
      },
    });
    ibiz.plugin.register(vm);
    vm.mount(container);
    this.vm = vm;
  }

  /**
   * 打开飘窗
   *
   * @author chitanda
   * @date 2022-11-09 12:11:52
   * @param {HTMLElement} target
   * @return {*}  {Promise<void>}
   */
  async present(): Promise<void> {
    return this.modal.present();
  }

  /**
   * 手动调用关闭飘窗
   *
   * @author chitanda
   * @date 2022-11-09 12:11:39
   * @param {unknown} [data]
   * @return {*}  {Promise<void>}
   */
  async dismiss(data?: unknown): Promise<void> {
    await this.modal.dismiss(data);
  }

  /**
   * 订阅窗口关闭
   *
   * @author chitanda
   * @date 2022-11-09 12:11:20
   * @template T
   * @return {*}  {Promise<T>}
   */
  async onWillDismiss<T = unknown>(): Promise<T> {
    return new Promise<T>(resolve => {
      const callback = (data: unknown) => {
        resolve(data as T);
        this.evt.off('dismiss', callback);
      };
      this.evt.on('dismiss', callback);
    });
  }
}
