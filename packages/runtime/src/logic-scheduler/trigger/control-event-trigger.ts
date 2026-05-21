import { StudioControlEvents } from '../../constant';
import type { ISchedulerLogic, ITriggerMatchParams } from '../../interface';
import { LogicScheduler } from '../scheduler/logic-scheduler';
import { LogicTrigger } from './logic-trigger';

/**
 * 部件事件触发器
 * @author lxm
 * @date 2023-08-14 02:10:46
 * @export
 * @class ControlEventTrigger
 * @extends {LogicTrigger}
 */
export class ControlEventTrigger extends LogicTrigger {
  declare type: 'CTRLEVENT';

  /**
   * 监听事件名称集合
   * @author lxm
   * @date 2023-07-26 05:48:30
   * @protected
   * @type {string[]}
   */
  protected listenEventNames: string[] = [];

  constructor(
    protected logic: ISchedulerLogic,
    protected scheduler: LogicScheduler,
    protected scriptArgKeys: string[] = [],
  ) {
    super(logic, scheduler, scriptArgKeys);
    const names = logic.eventNames!.split(';');
    this.listenEventNames = names.map(
      name => StudioControlEvents[name as keyof StudioControlEvents] || name,
    );
  }

  match(matchParams: ITriggerMatchParams): boolean {
    const superResult = super.match(matchParams);
    return (
      superResult &&
      // 忽略大小写匹配
      matchParams.ctrlName?.toLowerCase() ===
        this.logic.ctrlName!.toLowerCase() &&
      this.listenEventNames.includes(matchParams.eventName!)
    );
  }
}
