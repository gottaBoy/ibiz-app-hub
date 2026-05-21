/* eslint-disable @typescript-eslint/no-explicit-any */
import { IAppViewEngine } from '@ibiz/model-core';
import { ICtrlEngine, IViewEngine } from '../interface/engine';

type NewEngine = (...args: any[]) => IViewEngine;

type NEWCtrlEngine = (...args: any[]) => ICtrlEngine;

/**
 * 引擎工厂
 * @author lxm
 * @date 2023-04-25 07:17:42
 * @export
 * @class EngineFactory
 */
export class EngineFactory {
  /**
   * 视图引擎classMap
   * @author lxm
   * @date 2023-04-25 07:28:36
   * @protected
   */
  protected viewEngines = new Map<string, NewEngine>();

  /**
   * @description 部件引擎classMap
   * @protected
   * @memberof EngineFactory
   */
  protected ctrlEngines = new Map<string, NEWCtrlEngine>();

  /**
   * 注册视图引擎
   * @author lxm
   * @date 2023-04-25 07:40:23
   * @param {string} key
   * @param {IViewEngine} engine
   */
  register(key: string, engine: NewEngine): void {
    this.viewEngines.set(key, engine);
  }

  /**
   * @description 注册部件引擎
   * @param {string} key
   * @param {NEWCtrlEngine} engine
   * @memberof EngineFactory
   */
  registerCtrl(key: string, engine: NEWCtrlEngine): void {
    this.ctrlEngines.set(key, engine);
  }

  /**
   * 注销视图引擎
   * @author lxm
   * @date 2023-04-25 07:40:32
   * @param {string} key
   */
  unRegister(key: string): void {
    this.viewEngines.delete(key);
  }

  /**
   * @description 注销部件引擎
   * @param {string} key
   * @memberof EngineFactory
   */
  unRegisterCtrl(key: string): void {
    this.ctrlEngines.delete(key);
  }

  /**
   * 获取视图引擎
   * @author lxm
   * @date 2023-05-04 02:26:34
   * @param {IAppView} model
   * @param {IViewController} viewController 视图控制器
   * @return {*}  {(ViewEngine | undefined)}
   */
  getEngine(
    model: IAppViewEngine,
    ...args: Parameters<NewEngine>
  ): IViewEngine | undefined {
    const { engineType, engineCat } = model;

    const key = `${engineCat}_${engineType}`;
    const func = this.viewEngines.get(key);

    // 存在则执行，生成对象
    if (func) {
      return func(...args);
    }
    ibiz.log.error(
      ibiz.i18n.t('runtime.engine.correspondingEngine', { key }),
      model,
    );
  }

  /**
   * @description 获取部件引擎
   * @param {IAppViewEngine} model
   * @param {...Parameters<NEWCtrlEngine>} args
   * @returns {*}  {(ICtrlEngine | undefined)}
   * @memberof EngineFactory
   */
  getCtrlEngine(
    model: IAppViewEngine,
    ...args: Parameters<NEWCtrlEngine>
  ): ICtrlEngine | undefined {
    const { engineType, engineCat } = model;

    const key = `${engineCat}_${engineType}`;
    const func = this.ctrlEngines.get(key);

    // 存在则执行，生成对象
    if (func) {
      return func(model, ...args);
    }
    ibiz.log.error(
      ibiz.i18n.t('runtime.engine.correspondingEngine', { key }),
      model,
    );
  }
}
