import { IAppViewEngine } from '@ibiz/model-core';
import { CtrlLoadAndSearchEngine } from './ctrl-load-and-search.engine';
import { CtrlLoadTriggerEngine } from './ctrl-load-trigger.engine';
import { ViewController } from '../../controller';

// 安装部件引擎
export const installCtrlEngine = (): void => {
  ibiz.engine.registerCtrl(
    'CTRL_CtrlLoadAndSearch',
    (model: IAppViewEngine, c: ViewController) =>
      new CtrlLoadAndSearchEngine(model, c),
  );
  ibiz.engine.registerCtrl(
    'CTRL_CtrlLoadTrigger',
    (model: IAppViewEngine, c: ViewController) =>
      new CtrlLoadTriggerEngine(model, c),
  );
};
