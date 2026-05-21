import { Ref, ref } from 'vue';

/**
 * @description 截图状态管理对象
 * @export
 * @class ScreenShotStore
 */
export class ScreenShotStore {
  /**
   * @description 画布元素
   * @type {(Ref<HTMLCanvasElement | undefined>)}
   * @memberof ScreenShotStore
   */
  canvasElement: Ref<HTMLCanvasElement | undefined> = ref(undefined);

  /**
   * @description 文本输入框颜色
   * @type {(Ref<HTMLCanvasElement | undefined>)}
   * @memberof ScreenShotStore
   */
  textInputElement: Ref<HTMLCanvasElement | undefined> = ref(undefined);

  /**
   * @description 加载状态
   * @type {Ref<boolean>}
   * @memberof ScreenShotStore
   */
  isLoading: Ref<boolean> = ref(false);

  /**
   * @description 文本状态
   * @type {Ref<boolean>}
   * @memberof ScreenShotStore
   */
  textStatus: Ref<boolean> = ref(false);

  /**
   * @description 工具栏状态
   * @type {Ref<boolean>}
   * @memberof ScreenShotStore
   */
  toolbarStatus: Ref<boolean> = ref(false);

  /**
   * @description 当前工具名称
   * @type {Ref<boolean>}
   * @memberof ScreenShotStore
   */
  toolbarName: Ref<string | void> = ref();

  /**
   * @description 历史
   * @type {Ref<{ data: ImageData }[]>}
   * @memberof ScreenShotStore
   */
  history: Ref<{ data: ImageData }[]> = ref([]);
}
