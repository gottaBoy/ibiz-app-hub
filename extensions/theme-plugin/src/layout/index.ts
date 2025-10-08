import DEGridView from './de-grid-view-layout';

export function install(callBack: (key: string, model: any) => void): void {
  // 实体表格视图
  callBack('DEGRIDVIEW_DEFAULT', DEGridView);
}
