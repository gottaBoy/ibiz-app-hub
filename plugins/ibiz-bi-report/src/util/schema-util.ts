import { ISchemaField } from '../interface';
import { TypeToOPs } from './fliter-util';

/**
 * 获取实体的jsonschema
 *
 * @export
 * @param {string} entityId 实体标识
 * @return {*}  {Promise<IData>}
 */
export async function getSchemaByEntity(
  entityId: string,
  appId: string,
): Promise<IData> {
  const entity = await ibiz.hub.getAppDataEntity(entityId, appId);
  let url = `/jsonschema/${entity.name}`;
  if (entity.dynaSysMode === 0 && ibiz.appData) {
    url += `?dynamodeltag=${ibiz.appData.dynamodeltag}`;
  }
  const app = await ibiz.hub.getAppAsync(appId);
  const res = await app.net.get(url);
  return res.data;
}

/**
 * 根据jsonSchema模型计算出Schema属性
 *
 * @export
 * @param {IData} jsonSchema jsonSchema数据对象
 * @return {*}  {Promise<ISchemaField[]>}
 */
export async function calcSchemaFieldBySchema(
  jsonSchema: IData,
): Promise<ISchemaField[]> {
  if (!jsonSchema.properties) {
    return [];
  }
  const { properties } = jsonSchema;
  if (!(Object.keys(properties).length > 0)) {
    return [];
  }

  const schemaFields: ISchemaField[] = [];

  Object.keys(properties).forEach((key: string) => {
    let type: string = 'string';
    const originalType = properties[key].type;
    switch (properties[key].type) {
      case 'string':
        if (properties[key].format === 'date-time') {
          type = 'date';
        }
        if (properties[key].$ref) {
          type = 'dataPicker';
        }
        if (properties[key].enumSource) {
          type = 'dropdown';
        }
        break;
      case 'integer':
      case 'number':
        type = 'number';
        if (properties[key].enumSource) {
          type = 'dropdown';
        }
        break;
      default:
        if (properties[key].$ref) {
          type = 'dataPicker';
        }
        break;
    }
    schemaFields.push({
      type,
      originalType,
      appDEFieldId: key,
      valueOPs: TypeToOPs[type],
      caption: properties[key].description,
      appDataEntityId: properties[key].$ref?.split('.')[0],
      appCodeListId: properties[key].enumSource,
    });
  });
  return schemaFields;
}
