import {
  getEditorEmits,
  getEditorProps,
  getGridEditorCommonProps,
} from './common';

/**
 * @description 获取MARKDOWN编辑器props
 * @export
 * @template C
 * @returns {*}
 * @editorprops
 */
export function getMarkDownProps<C>() {
  return {
    ...getEditorProps<C>(),
    /**
     * @description 容器数据，通常为表单数据，表格行数据，面板数据
     */
    data: { type: Object, required: false },
    /**
     * @description 编辑器控制器对象
     */
    controller: { type: Object, required: false },
    /**
     * @description 是否禁用
     */
    disabled: { type: Boolean, required: false },
    /**
     * @description 切片视图
     */
    chunkView: { type: String, required: false },
    /**
     * @description 切片实体
     */
    chunkEntity: { type: String, required: false },
    /**
     * @description 上下文
     */
    context: { type: Object, required: false },
    /**
     * @description 部件
     */
    ctrl: { type: Object, required: false },
    /**
     * @description 视图
     */
    view: { type: Object, required: false },
  };
}

/**
 * @description 获取表格MARKDOWN编辑器props
 * @export
 * @template C
 * @returns {*}
 */
export function getGridMarkDownProps<C>() {
  return { ...getMarkDownProps<C>(), ...getGridEditorCommonProps() };
}

/**
 * @description 获取MarkDown编辑器通用emits
 * @export
 * @returns {*}
 * @editoremits
 */
export function getMarkDownEmits() {
  return {
    ...getEditorEmits(),
    /**
     * 自定义行为事件
     * @description 自定义行为事件，action：行为标识，value：行为参数
     */
    customAction: (_value: unknown) => true,
  };
}
