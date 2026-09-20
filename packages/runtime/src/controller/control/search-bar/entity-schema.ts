import { IDropDownList, IEditor, ISearchBarFilter } from '@ibiz/model-core';
import { ValueOP } from '../../../constant';
import { ExcludeOPs } from './search-bar-filter.controller';

type ISchemaField = {
  type: string;
  key: string;
  description: string;
  enumSource?: string;
};

const appId = '';

/** 数据类型映射操作符号 */
const typeToOPs: {
  [p: string]: ValueOP[];
} = {
  string: [
    ValueOP.EQ,
    ValueOP.NOT_EQ,
    ValueOP.IS_NULL,
    ValueOP.IS_NOT_NULL,
    ValueOP.USER_LIKE,
    ValueOP.LIKE,
    ValueOP.LIFT_LIKE,
    ValueOP.RIGHT_LIKE,
  ],
  number: [
    ValueOP.EQ,
    ValueOP.GT,
    ValueOP.GT_AND_EQ,
    ValueOP.LT,
    ValueOP.LT_AND_EQ,
    ValueOP.NOT_EQ,
    ValueOP.IS_NULL,
    ValueOP.IS_NOT_NULL,
    ValueOP.IN,
    ValueOP.NOT_IN,
  ],
  date: [
    ValueOP.EQ,
    ValueOP.GT,
    ValueOP.GT_AND_EQ,
    ValueOP.LT,
    ValueOP.LT_AND_EQ,
    ValueOP.NOT_EQ,
    ValueOP.IS_NULL,
    ValueOP.IS_NOT_NULL,
    ValueOP.IN,
    ValueOP.NOT_IN,
  ],
};

/** 数据类型和操作符映射的编辑器模型 */
const EditorsMap: {
  [p: string]: IEditor;
} = {};

/**
 * 初始化默认映射的编辑器模型
 * @author lxm
 * @date 2024-01-02 10:32:05
 * @param {string} type
 * @param {string} op
 * @return {*}  {IEditor}
 */
function initDefaultEditor(): void {
  Object.keys(typeToOPs).forEach(type => {
    const allowOPs = typeToOPs[type];
    allowOPs.forEach(op => {
      if (ExcludeOPs.includes(op)) {
        return;
      }

      const key = `${type}_${op}`;
      if (EditorsMap[key]) {
        return;
      }

      if (type === 'date' && ![ValueOP.IN, ValueOP.NOT_IN].includes(op)) {
        EditorsMap[key] = {
          appId,
          editorType: 'DATEPICKER',
          id: key,
        };
      } else {
        // 都可以给字符串类型
        EditorsMap[key] = {
          appId,
          editorType: 'TEXTBOX',
          id: key,
        };
      }
    });
  });
}

initDefaultEditor();

function getEditor(field: ISchemaField, op: string): IEditor {
  if (field.enumSource) {
    return {
      appId,
      editorType: 'DROPDOWNLIST',
      singleSelect: true,
      valueType: 'SIMPLE',
      appCodeListId: field.enumSource,
      id: `${field.key}_${op}`,
    } as IDropDownList;
  }
  const editorModel = EditorsMap[`${field.type}_${op}`];
  return editorModel;
}

/**
 * 根据json模型计算出过滤项模型
 * @author lxm
 * @date 2024-01-02 10:27:40
 * @export
 * @param {IData} json
 * @param {SearchBarController} c
 * @return {*}  {ISearchBarFilter[]}
 */
export async function calcFilterModelBySchema(
  json: IData,
  appDataEntityId: string,
  modelAppId: string,
): Promise<ISearchBarFilter[]> {
  if (!json.properties) {
    return [];
  }
  const { properties } = json;
  if (!(Object.keys(properties).length > 0)) {
    return [];
  }

  // 属性codeName对应的属性id
  const codeNameToId: { [p: string]: string } = {};
  const dataEntity = await ibiz.hub.getAppDataEntity(
    appDataEntityId,
    modelAppId,
  );
  dataEntity.appDEFields?.forEach(field => {
    codeNameToId[field.codeName!.toLowerCase()] = field.id!;
  });

  const addFields: ISchemaField[] = [];

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
        enumSource: properties[key].enumSource,
      });
    }
  });

  const addSearchBarFilters: ISearchBarFilter[] = [];

  addFields.forEach(item => {
    const ops = typeToOPs[item.type];
    if (!ops) {
      ibiz.log.error(
        ibiz.i18n.t('runtime.controller.control.grid.unsupported', {
          type: '',
        }),
        item.type,
      );
      return;
    }
    ops.forEach(op => {
      if (item)
        addSearchBarFilters.push({
          appId,
          appDEFieldId: codeNameToId[item.key],
          id: item.key,
          caption: item.description,
          defsearchMode: {
            appId,
            valueOP: op,
          },
          editor: getEditor(item, op),
        });
    });
  });

  return addSearchBarFilters;
}
