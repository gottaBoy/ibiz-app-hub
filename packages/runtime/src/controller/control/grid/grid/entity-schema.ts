import { IDEGridDataItem, IDEGridFieldColumn } from '@ibiz/model-core';
import { GridController } from './grid.controller';

const TypeToDataType: { [p: string]: number } = {
  string: 25,
  number: 6,
  integer: 9,
  date: 5,
} as const;

/**
 * 根据json模型计算出表格列模型
 * @author lxm
 * @date 2024-01-02 10:27:40
 * @export
 * @param {IData} json
 * @param {SearchBarController} c
 * @return {*}  {ISearchBarFilter[]}
 */
export async function calcColumnModelBySchema(
  json: IData,
  c: GridController,
): Promise<
  | { degridColumns: IDEGridFieldColumn[]; degridDataItems: IDEGridDataItem[] }
  | undefined
> {
  if (!json.properties) {
    return;
  }
  const { properties } = json;
  if (!(Object.keys(properties).length > 0)) {
    return;
  }

  // 属性codeName对应的属性id
  const codeNameToId: { [p: string]: string } = {};
  const dataEntity = await ibiz.hub.getAppDataEntity(
    c.model.appDataEntityId!,
    c.model.appId,
  );
  dataEntity.appDEFields?.forEach(field => {
    codeNameToId[field.codeName!.toLowerCase()] = field.id!;
  });

  const addFields: {
    key: string;
    description: string;
    type: string;
  }[] = [];

  const items = ibiz.util.jsonSchema
    .sortProperties(Object.entries(properties))
    .map(item => item[0]);

  items.forEach((key: string) => {
    if (!codeNameToId[key]) {
      let type: string;

      switch (properties[key].type) {
        case 'string':
          type = 'string';
          if (properties[key].format === 'date-time') {
            type = 'date';
          }
          break;
        case 'integer':
          type = 'integer';
          break;
        case 'number':
          type = 'number';
          break;
        default:
          if (properties[key].$ref && properties[key].type == null) {
            return;
          }
          ibiz.log.error(
            ibiz.i18n.t('runtime.controller.control.grid.unsupported', {
              type: properties[key].type,
            }),
          );
          return;
      }

      addFields.push({
        key,
        description: properties[key].description,
        type,
      });
    }
  });

  const addColumns: IDEGridFieldColumn[] = [];
  const addDataItems: IDEGridDataItem[] = [];

  addFields.forEach(item => {
    addColumns.push({
      appId: c.model.appId,
      appDEFieldId: item.key,
      id: item.key,
      codeName: item.key,
      columnType: 'DEFGRIDCOLUMN',
      width: 150,
      widthUnit: 'PX',
      valueType: 'SIMPLE',
      caption: item.description,
      hideDefault: true,
      dataItemName: item.key,
    });

    addDataItems.push({
      appId: c.model.appId,
      appDEFieldId: item.key,
      id: item.key,
      valueType: 'SIMPLE',
      dataType: TypeToDataType[item.type],
    });
  });

  return { degridColumns: addColumns, degridDataItems: addDataItems };
}
