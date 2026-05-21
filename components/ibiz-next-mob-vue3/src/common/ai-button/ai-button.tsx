import {
  ref,
  VNode,
  computed,
  onUnmounted,
  CSSProperties,
  defineComponent,
} from 'vue';
import { ISysImage } from '@ibiz/model-core';
import { IBizContext } from '@ibiz-template/core';
import { useUIStore, useNamespace } from '@ibiz-template/vue3-util';
import { IUILogicParams, UIActionUtil } from '@ibiz-template/runtime';
import './ai-button.scss';

const AISvg = (): VNode => (
  <svg viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg'>
    <path d='M481.0752 263.3728l50.9952 1.024 1.8432-105.8816-50.9952-0.8192z'></path>
    <path d='M486.441426 180.895362a66.56 66.56 0 1 0 42.091944-126.290153 66.56 66.56 0 1 0-42.091944 126.290153Z'></path>
    <path d='M138.8544 664.3712c-52.8384 0-95.8464-43.008-95.8464-95.8464s43.008-95.8464 95.8464-95.8464M880.0256 472.6784c52.8384 0 95.8464 43.008 95.8464 95.8464s-43.008 95.8464-95.8464 95.8464'></path>
    <path d='M507.4944 220.5696c-220.16 0-398.7456 162.816-398.7456 363.7248s178.5856 363.7248 398.7456 363.7248 398.7456-162.816 398.7456-363.7248-178.5856-363.7248-398.7456-363.7248z m0 559.9232c-166.2976 0-301.2608-100.5568-301.2608-224.4608s134.9632-224.4608 301.2608-224.4608S808.7552 432.128 808.7552 556.032 673.792 780.4928 507.4944 780.4928z'></path>
    <path d='M319.6928 556.032a47.9232 38.912 90 1 0 77.824 0 47.9232 38.912 90 1 0-77.824 0Z'></path>
    <path d='M617.472 556.032a47.9232 38.912 90 1 0 77.824 0 47.9232 38.912 90 1 0-77.824 0Z'></path>
  </svg>
);

interface IAIAssistantState {
  /**
   * @description 应用标识
   * @type {string}
   * @memberof IAIAssistant
   */
  appId: string;
  /**
   * @description 是否显示
   * @type {boolean}
   * @memberof IAIAssistant
   */
  visible: boolean;
  /**
   * @description 行为类型
   * @type {string}
   * @memberof IAIAssistant
   */
  actionType: string;
  /**
   * @description 行为标识
   * @type {string}
   * @memberof IAIAssistant
   */
  uiActionId: string;
  /**
   * @description 出现位置
   * @type {('left'
   *     | 'left-start'
   *     | 'left-end'
   *     | 'right'
   *     | 'right-start'
   *     | 'right-end')}
   * @memberof IAIAssistant
   */
  placement:
    | 'left'
    | 'left-start'
    | 'left-end'
    | 'right'
    | 'right-start'
    | 'right-end';
  /**
   * @description 自定义图标
   * @type {ISysImage}
   * @memberof IAIAssistant
   */
  sysImage?: ISysImage;
}

export const IBizAIButton = defineComponent({
  name: 'IBizAIButton',
  setup() {
    const ns = useNamespace('ai-button');
    const { zIndex } = useUIStore();

    const params = ibiz.util.getGlobalParam();

    const state = computed<IAIAssistantState | undefined>(() => {
      return params.AIAssistantState;
    });

    const style = ref<CSSProperties>({
      zIndex: zIndex.increment(),
    });

    const isAdsorption = ref(true);

    onUnmounted(() => {
      zIndex.decrement();
    });

    /**
     * @description 处理按钮点击
     * @param {MouseEvent} event
     * @returns {*}  {Promise<void>}
     */
    const handleButtonClick = async (event: MouseEvent): Promise<void> => {
      // 如果是吸附模式则切换为正常模式
      if (isAdsorption.value) {
        isAdsorption.value = false;
        // 用户3秒未操作自动变为吸附模式
        setTimeout(() => {
          isAdsorption.value = true;
        }, 3000);
      } else {
        // 判断是否已打开聊天框
        const chatInstance = await ibiz.aiChatUtil.getAIChat();
        if (chatInstance.container) {
          chatInstance.close?.();
          return;
        }
        const { uiActionId, appId } = state.value!;
        await UIActionUtil.execAndResolved(
          uiActionId,
          {
            event,
            data: [],
            params: {},
            view: undefined,
            ctrl: undefined,
            context: IBizContext.create(ibiz.appData?.context || {}),
          } as unknown as IUILogicParams,
          appId,
        );
      }
    };

    return {
      ns,
      state,
      style,
      isAdsorption,
      handleButtonClick,
    };
  },
  render() {
    if (!this.state?.visible) return;
    return (
      <div
        class={[
          this.ns.b(),
          this.ns.is(this.state.placement, true),
          this.ns.is('adsorption', this.isAdsorption),
        ]}
        style={this.style}
        onClick={this.handleButtonClick}
      >
        <div class={this.ns.e('content')}>
          {this.state.sysImage ? (
            <iBizIcon
              icon={this.state.sysImage}
              class={this.ns.em('content', 'icon')}
            />
          ) : (
            AISvg()
          )}
        </div>
      </div>
    );
  },
});
