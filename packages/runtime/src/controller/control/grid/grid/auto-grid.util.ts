/* eslint-disable no-nested-ternary */
import { clone } from 'ramda';
import {
  IEditor,
  IPicker,
  IDatePicker,
  IDropDownList,
  IDEGridDataItem,
  IDEFVRCondition,
  IDEGridEditItem,
  IDEGridEditItemVR,
  IDEGridFieldColumn,
} from '@ibiz/model-core';
import { mergeDefaultInLeft } from '@ibiz-template/core';
import { GridController } from './grid.controller';
import { getEntitySchema } from '../../../utils';
import { GridRowState } from './grid-row.state';
import { GridNotifyState } from '../../../constant';
import { Srfuf } from '../../../../service';
import { CodeListItem } from '../../../../interface';

const TypeToDataType: { [p: string]: number } = {
  string: 25,
  number: 6,
  integer: 9,
  date: 27,
  time: 28,
  'date-time': 5,
} as const;

const TypeToEditor: {
  [p: string]: IEditor | IDropDownList | IPicker | IDatePicker;
} = {
  string: {
    appId: '',
    editorType: 'TEXTBOX',
  },
  number: {
    appId: '',
    editorType: 'NUMBER',
  },
  date: {
    appId: '',
    editorType: 'DATEPICKEREX_NOTIME',
  },
  'date-time': {
    appId: '',
    editorType: 'DATEPICKER',
  },
  time: {
    appId: '',
    editorType: 'DATEPICKEREX_NODAY',
  },
  dropdown: {
    appId: '',
    valueType: 'SIMPLE',
    editorType: 'MDROPDOWNLIST_VIRTUALIZED_LIST',
    appCodeListId: '',
    editorParams: {
      overflowMode: 'ellipsis',
    },
  },
  span: {
    appId: '',
    editorType: 'SPAN',
  },
};

/**
 * 获取编辑器模型
 *
 * @param {IData} item 数据
 * @param {string} appId 应用标识
 * @param {(0 | 1 | 2 | 3)} enableCond 启用条件{0：无、 1：建立、 2：更新、 3：全部 }
 * @param {boolean} [isSingleSelect=false] 是否单选
 * @return {*}  {IEditor}
 */
function getEditorModel(
  item: IData,
  appId: string,
  enableCond: 0 | 1 | 2 | 3,
  isSingleSelect: boolean = false,
): IEditor {
  let type = ['integer', 'number'].includes(item.type) ? 'number' : 'string';
  if (['date', 'date-time', 'time'].includes(item.format)) type = item.format;
  if (item.enumSource || item.enumOptions) type = 'dropdown';
  // 不启用时使用span标签
  if (enableCond === 0) type = 'span';
  const model = Object.assign(clone(TypeToEditor[type]), {
    appId,
  });
  if (type === 'dropdown' && isSingleSelect)
    model.editorType = 'DROPDOWNLIST_VIRTUALIZED_LIST';
  if (item.enumSource) {
    Object.assign(model, {
      appCodeListId: item.enumSource,
    });
  } else if (item.enumOptions) {
    const enumOptions: CodeListItem[] = [];
    Object.keys(item.enumOptions).forEach(key => {
      enumOptions.push({
        id: key,
        value: key,
        text: item.enumOptions[key],
      });
    });
    Object.assign(model.editorParams!, { enumOptions });
  }
  return model;
}

/**
 * 根据json模型计算出表格模型
 *
 * @param {IData} json
 * @param {GridController} c
 * @return {*}  {(Promise<
 *   | {
 *       degridColumns: IDEGridFieldColumn[];
 *       degridDataItems: IDEGridDataItem[];
 *       degridEditItems: IDEGridEditItem[];
 *     }
 *   | undefined
 * >)}
 */
export async function calcColumnModelBySchema(
  json: IData,
  c: GridController,
): Promise<{
  degridColumns: IDEGridFieldColumn[];
  degridDataItems: IDEGridDataItem[];
  degridEditItems: IDEGridEditItem[];
  degridEditItemVRs: IDEGridEditItemVR[];
}> {
  const columns: IDEGridFieldColumn[] = [];
  const dataItems: IDEGridDataItem[] = [];
  const editItems: IDEGridEditItem[] = [];
  const editItemVRs: IDEGridEditItemVR[] = [];
  if (json.properties && Object.keys(json.properties).length > 0) {
    const { properties } = json;
    const {
      disableonupdate,
      disableoncreate,
      propertyorder,
      singleselect,
      enablesort,
    } = c.controlParams;
    // 必填列
    const required: string[] = json.required || [];
    // 排序列
    const sorts: string[] = json[enablesort] || [];
    // 单选列表
    const singleSelect: string[] = json[singleselect] || [];
    // 列排序
    const columnKeys: string[] = json[propertyorder] || [];
    // 更新时禁用
    const disableUpdate: string[] = json[disableonupdate] || [];
    // 新建时禁用
    const disableCreate: string[] = json[disableoncreate] || [];
    columnKeys.forEach(key => {
      if (properties[key]) {
        let type: string | undefined;
        switch (properties[key].type) {
          case 'string':
            type = 'string';
            if (
              ['date', 'date-time', 'time'].includes(properties[key].format)
            ) {
              type = properties[key].format;
            }
            break;
          case 'integer':
            type = 'integer';
            break;
          case 'number':
            type = 'number';
            break;
          default:
            if (!(properties[key].$ref && properties[key].type == null)) {
              ibiz.log.error(
                ibiz.i18n.t('runtime.controller.control.grid.unsupported', {
                  type: properties[key].type,
                }),
              );
            }
        }
        if (type) {
          columns.push({
            appId: c.model.appId,
            appDEFieldId: key,
            id: key,
            codeName: key,
            columnType: 'DEFGRIDCOLUMN',
            width: 140,
            widthUnit: 'STAR',
            valueType: 'SIMPLE',
            caption: properties[key].description,
            hideDefault: false,
            enableRowEdit: true,
            enableSort: sorts.includes(key),
            dataItemName: key,
          });
          // 启用条件
          const enableCond = disableUpdate.includes(key)
            ? disableCreate.includes(key)
              ? 0
              : 1
            : disableCreate.includes(key)
              ? 2
              : 3;
          editItems.push({
            codeName: key,
            enableCond,
            allowEmpty: !required.includes(key),
            appId: c.model.appId,
            editor: getEditorModel(
              properties[key],
              c.model.appId,
              enableCond,
              singleSelect.includes(key),
            ),
          });

          dataItems.push({
            id: key,
            appId: c.model.appId,
            appDEFieldId: key,
            valueType: 'SIMPLE',
            dataType: TypeToDataType[type],
          });
          // 长度规则
          if (properties[key].length) {
            editItemVRs.push({
              checkMode: 1,
              appId: c.model.appId,
              degridEditItemName: key,
              valueRuleType: 'DEFVALUERULE',
              defvalueRule: {
                appId: c.model.appId,
                groupCond: {
                  appId: c.model.appId,
                  condType: 'GROUP',
                  conds: [
                    {
                      defname: key,
                      appId: c.model.appId,
                      ruleInfo: ibiz.i18n.t(
                        'runtime.controller.utils.valueRule.length',
                        {
                          maxLength: properties[key].length,
                        },
                      ),
                      condType: 'STRINGLENGTH',
                      maxValue: properties[key].length,
                    } as IDEFVRCondition,
                  ],
                },
              },
            });
          }
        }
      }
    });
  }

  return {
    degridColumns: columns,
    degridDataItems: dataItems,
    degridEditItems: editItems,
    degridEditItemVRs: editItemVRs,
  };
}

/**
 * 根据jsonschema初始化自定义表格模型
 *
 * @export
 * @param {GridController} c
 * @return {*}  {Promise<void>}
 */
export async function initModelByEntitySchema(
  c: GridController,
): Promise<void> {
  const json = await getEntitySchema(
    c.model.appDataEntityId!,
    c.context,
    c.jsonSchemaParams,
  );
  if (!json) return;
  const { degridColumns, degridDataItems, degridEditItems, degridEditItemVRs } =
    await calcColumnModelBySchema(json, c);
  // 修改模型之前拷贝一份，避免污染原始数据
  (c as IData).model = clone(c.model);
  const uaColumns =
    c.model.degridColumns?.filter(
      column => column.columnType === 'UAGRIDCOLUMN',
    ) || [];
  const hideColumns =
    c.model.degridColumns?.filter(column => column.hideMode === 2) || [];
  c.model.degridColumns = [...degridColumns, ...hideColumns, ...uaColumns];
  c.model.degridDataItems = [
    ...(c.model.degridDataItems || []),
    ...degridDataItems,
  ];
  c.model.degridEditItems = [
    ...(c.model.degridEditItems || []),
    ...degridEditItems,
  ];
  c.model.degridEditItemVRs = [...degridEditItemVRs];
}

/**
 * 动态表格行编辑
 *
 * @export
 * @param {GridController} c
 * @param {GridRowState} row
 * @param {boolean} [editable]
 * @param {boolean} [_isSave=true]
 * @return {*}  {Promise<void>}
 */
export async function switchRowEditDynamic(
  c: GridController,
  row: GridRowState,
  editable?: boolean,
  _isSave: boolean = true,
): Promise<void> {
  if (!c.allowRowEdit) return;
  const toState = editable === undefined ? !row.showRowEdit : editable;
  // 一样的状态不处理
  if (row.showRowEdit === toState) return;

  if (toState === false) {
    // * 处理关闭行编辑
    if (row.modified) {
      try {
        await c.save(row.data);
      } catch (error) {
        ibiz.message.error((error as IData).message);
        if (row.data.srfuf === Srfuf.CREATE) {
          return c.remove({ data: [row.data], silent: true });
        }
        if (row.cacheData) {
          // 取消的时候，还原编辑前的数据
          row.data = row.cacheData;
          delete row.cacheData;
        }
      }
    } else if (row.data.srfuf === Srfuf.CREATE) {
      // 新建的行取消时删除这一行的数据
      row.showRowEdit = false;
      c.evt.emit('onRowEditChange', { row });
      return c.remove({ data: [row.data], silent: true });
    }
  } else {
    // 如果已经有一行处于行编辑了，切换该行的编辑状态
    const editingRow = c.state.rows.find(item => item.showRowEdit);
    if (editingRow) {
      await switchRowEditDynamic(c, editingRow);
    }
    if (row.data.srfuf === Srfuf.UPDATE) {
      // 打开时先缓存一下
      row.cacheData = clone(row.data);
      // 填充更新默认值
      const defaultVal = c.calcDefaultValue(row.data, false);
      Object.assign(row.data, defaultVal);
    }
  }

  // 修改行的编辑状态和编辑列的编辑状态。
  row.showRowEdit = toState;
  Object.values(c.editColumns).forEach(column => {
    row.editColStates[column.fieldName].editable = toState;
  });
  c.evt.emit('onRowEditChange', { row });
}

/**
 * 动态表格新建行
 *
 * @export
 * @param {GridController} c
 * @return {*}  {Promise<void>}
 */
export async function newRowDynamic(c: GridController): Promise<void> {
  const { enableRowEdit, enableRowNew } = c.model;
  if (!enableRowEdit || !enableRowNew) {
    ibiz.log.error(ibiz.i18n.t('runtime.controller.control.grid.newRows'));
    return;
  }

  // 如果已经有一行处于行编辑了，切换该行的编辑状态
  const editingRow = c.state.rows.find(item => item.showRowEdit);
  if (editingRow && c.editShowMode === 'row') await c.switchRowEdit(editingRow);

  const queryParams = { ...c.params };
  const defaultData = c.calcDefaultValue({}, true); // 新建默认值
  Object.assign(queryParams, defaultData);

  let res;
  try {
    res = await c.service.getDraft(c.context, queryParams);
  } catch (error) {
    c.actionNotification('GETDRAFTERROR', {
      error: error as Error,
    });
    throw error;
  }

  const draftData = res.data;
  // 处理后台导致的新建默认值丢失
  mergeDefaultInLeft(draftData, defaultData);

  // 加载完后续处理
  c.state.items.push(draftData);
  const row = new GridRowState(draftData, c);
  c.state.rows.push(row);
  c.gridStateNotify(row, GridNotifyState.DRAFT);

  if (c.editShowMode === 'row') c.switchRowEdit(row, true);

  c.actionNotification('GETDRAFTSUCCESS', { data: draftData });
}
