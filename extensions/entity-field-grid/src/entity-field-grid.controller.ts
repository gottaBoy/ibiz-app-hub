import { GridController } from '@ibiz-template/runtime';
import { clone } from 'ramda';

export class EntityFieldGridController extends GridController {
  protected async onCreated(): Promise<void> {
    if (this.model.appDataEntityId) {
      (this as IData).model = clone(this.model);
      const entity = await ibiz.hub.getAppDataEntity(
        this.model.appDataEntityId!,
        this.model.appId,
      );
      if (entity) {
        const degridColumns = entity.appDEFields?.map(field => {
          return {
            dataItemName: field.id,
            appDEFieldId: field.id,
            valueType: 'SIMPLE',
            align: 'LEFT',
            capLanguageRes: field.lnlanguageRes,
            caption: field.logicName,
            codeName: field.id,
            columnType: 'DEFGRIDCOLUMN',
            width: 200,
            widthUnit: 'PX',
            enableSort: true,
            id: field.id,
            appId: field.appId,
          };
        });
        const degridDataItems = entity.appDEFields?.map(field => {
          return {
            appDEFieldId: field.id,
            valueType: 'SIMPLE',
            dataType: field.stdDataType,
            id: field.id,
            appId: field.appId,
          };
        });
        this.model.degridColumns = degridColumns;
        this.model.degridDataItems = degridDataItems;
        if (this.controlParams.showcolumns) {
          const showColumns = JSON.parse(this.controlParams.showcolumns);
          const set = new Set(showColumns);
          this.model.degridColumns = this.model.degridColumns?.filter(column =>
            set.has(column.id),
          );
        }
      }
    }
    return super.onCreated();
  }
}
