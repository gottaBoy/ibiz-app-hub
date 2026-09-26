import { getEditorProps, getGridEditorCommonProps } from './common';

/**
 * @description 获取标签props
 * @export
 * @template C
 * @returns {*}
 * @editorprops
 */
export function getSpanProps<C>() {
  return {
    ...getEditorProps<C>(),
    /**
     * @description 编辑器值
     */
    value: [String, Number, Object, Array],
    /**
     * @description 是否显示title
     * @default true
     */
    showTitle: { type: Boolean, default: true },
  };
}

/**
 * @description 获取表格标签props
 * @export
 * @template C
 * @returns {*}
 */
export function getGridSpanProps<C>() {
  return { ...getSpanProps<C>(), ...getGridEditorCommonProps() };
}
