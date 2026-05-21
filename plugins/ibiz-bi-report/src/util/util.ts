import { ISchemaField } from '../interface';

/**
 * 计算界面行为标识
 *
 * @export
 * @param {IData} item
 * @return {*}  {(string | undefined)}
 */
export async function calcUIActionTag(
  item: IData,
  appId: string,
): Promise<string | undefined> {
  if (item.parampsdeuiactiontag) {
    const [actionId, deId] = item.parampsdeuiactiontag.split('@');
    const entityModel = await ibiz.hub.getAppDataEntity(deId, appId);
    return `${actionId}@${entityModel.codeName}`;
  }
}

/**
 * 获取schema属性
 *
 * @export
 * @param {string} appDeId 应用实体
 * @param {string} appDEFieldId 应用实体属性
 * @param {ISchemaField[]} schemaFields schema属性集合
 * @return {*}  {(Promise<ISchemaField | undefined>)}
 */
export async function getSchemaField(
  item: IData,
  schemaFields: ISchemaField[],
  appId: string,
): Promise<ISchemaField | undefined> {
  // 存在属性标识才计算，否则直接返回
  if (item.psdefid) {
    const appDEFieldId: string = item.psdefid.split('.').pop()?.toLowerCase();
    const appDeId = item.pssysbicubeid.split('.').pop();
    // 直接在schema属性集合找
    let field = schemaFields.find(v => v.appDEFieldId === appDEFieldId);
    if (!field) {
      // 不存在则在实体关系中查找
      const entityModel = await ibiz.hub.getAppDataEntity(appDeId, appId);
      const deRss = entityModel?.minorAppDERSs?.find(
        rs => rs.parentAppDEFieldId === appDEFieldId,
      );
      if (deRss && deRss.majorAppDataEntityId) {
        const [, major] = deRss.majorAppDataEntityId.split('.');
        const majorfield = schemaFields.find(v => v.appDEFieldId === major);
        field = { ...majorfield, appDEFieldId } as ISchemaField;
      }
    }
    return field;
  }
}
