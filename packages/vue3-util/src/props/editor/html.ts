import {
  getEditorEmits,
  getEditorProps,
  getGridEditorCommonProps,
} from './common';

/**
 * @description 获取html编辑框props
 * @export
 * @template C
 * @returns {*}
 * @editorprops
 */
export function getHtmlProps<C>() {
  return {
    ...getEditorProps<C>(),
    /**
     * @description 编辑器值
     */
    value: String,
  };
}

/**
 * @description 获取表格html编辑框props
 * @export
 * @template C
 * @returns {*}
 */
export function getGridHtmlProps<C>() {
  return { ...getHtmlProps<C>(), ...getGridEditorCommonProps() };
}

/**
 * @description 获取HTML编辑器通用emits
 * @export
 * @returns {*}
 * @editoremits
 */
export function getHtmlEmits() {
  return {
    ...getEditorEmits(),
    /**
     * 自定义行为事件
     * @description 自定义行为事件，action：行为标识，value：行为参数
     */
    customAction: (_value: unknown) => true,
  };
}
