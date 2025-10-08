import { IDEKanban } from '@ibiz/model-core';
import { DataViewControlService } from '../data-view';

/**
 * 看板（kanban）部件服务
 *
 * @export
 * @class DataViewControlService
 * @extends {MDControlService<IDEDataView>}
 */
export class KanbanService extends DataViewControlService<IDEKanban> {}
